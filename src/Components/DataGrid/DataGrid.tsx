import { Checkbox, Table, type SortDescriptor } from "@heroui/react";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Key,
  type ReactNode,
} from "react";

import { sortItems, type SortValue } from "../../utils/SortItems";

export interface IDataGridColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  sortValue?: (item: T) => SortValue;
  isRowHeader?: boolean;
}

export type SelectionMode = "none" | "single" | "multiple" | "all";

interface IDataGridProps<T> {
  data: T[];
  columns: IDataGridColumn<T>[];
  getRowId: (item: T) => string | number;
  selectionMode?: SelectionMode;
  getRowLabel?: (item: T) => string;
  defaultSort?: SortDescriptor;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  className?: string;
  emptyMessage?: string;
  sortDescriptor?: SortDescriptor;
  onSortChange?: (descriptor: SortDescriptor) => void;
}

const readValue = <T,>(item: T, column: IDataGridColumn<T>): SortValue => {
  if (column.sortValue) {
    return column.sortValue(item);
  }

  return (item as unknown as Record<string, unknown>)[column.key] as SortValue;
};

const setsEqual = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((value) => b.has(value));

function DataGridInner<T>({
  data,
  columns,
  getRowId,
  selectionMode = "none",
  getRowLabel,
  defaultSort,
  onSelectionChange,
  className = "min-w-[900px]",
  emptyMessage = "No data found.",
  sortDescriptor: controlledSortDescriptor,
  onSortChange,
}: IDataGridProps<T>) {

  const isControlledSort = controlledSortDescriptor !== undefined;

  const [internalSortDescriptor, setInternalSortDescriptor] =
    useState<SortDescriptor>(
      defaultSort ?? {
        column:
          columns.find((column) => column.sortable !== false)?.key ?? "",
        direction: "ascending",
      },
    );

  const sortDescriptor = controlledSortDescriptor ?? internalSortDescriptor;

  const handleSortChange = useCallback(
    (descriptor: SortDescriptor) => {
      if (!isControlledSort) {
        setInternalSortDescriptor(descriptor);
      }

      onSortChange?.(descriptor);
    },
    [isControlledSort, onSortChange],
  );

  const rows = useMemo(() => {
    if (isControlledSort) {
      return data;
    }

    const column = columns.find((col) => col.key === sortDescriptor.column);

    if (!column) {
      return data;
    }

    return sortItems(
      data,
      (item) => readValue(item, column),
      sortDescriptor.direction,
    );
  }, [data, columns, sortDescriptor, isControlledSort]);

  /*
   * Selection
   */
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const selectedRef = useRef<Set<string>>(new Set());

  const onSelectionChangeRef = useRef(onSelectionChange);

  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  const updateSelection = useCallback((next: Set<string>) => {
    selectedRef.current = next;
    setSelectedKeys(next);
    onSelectionChangeRef.current?.(next);
  }, []);

  const allKeys = useMemo(
    () => new Set(data.map((item) => String(getRowId(item)))),
    [data, getRowId],
  );

  useEffect(() => {
    const current = selectedRef.current;
    let next: Set<string>;

    if (selectionMode === "none") {
      next = new Set();
    } else if (selectionMode === "all") {
      next = new Set(allKeys);
    } else {
      next = new Set([...current].filter((key) => allKeys.has(key)));

      if (selectionMode === "single" && next.size > 1) {
        next = new Set([[...next][0]]);
      }
    }

    if (!setsEqual(next, current)) {
      updateSelection(next);
    }
  }, [selectionMode, allKeys, updateSelection]);

  const handleSelectionChange = (keys: "all" | Set<Key>) => {
    if (keys === "all") {
      updateSelection(new Set(allKeys));
      return;
    }

    const nextKeys = new Set([...keys].map(String));

    if (selectionMode === "single") {
      const added = [...nextKeys].filter(
        (key) => !selectedRef.current.has(key),
      );
      const picked = added.at(-1) ?? [...nextKeys].at(-1);

      updateSelection(picked ? new Set([picked]) : new Set());
      return;
    }

    updateSelection(nextKeys);
  };

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          className={className}
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          selectionMode={
            selectionMode === "none"
              ? "none"
              : selectionMode === "single"
                ? "single"
                : "multiple"
          }
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange}
        >
          <Table.Header>
            {selectionMode !== "none" && (
              <Table.Column className="pe-0">
                <Checkbox
                  aria-label="Select all"
                  slot="selection"
                  isDisabled={selectionMode === "single"}
                >
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox.Content>
                </Checkbox>
              </Table.Column>
            )}

            {columns.map((column, index) => (
              <Table.Column
                key={column.key}
                id={column.key}
                allowsSorting={column.sortable !== false}
                isRowHeader={column.isRowHeader ?? index === 0}
              >
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    {column.label}
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
            ))}
          </Table.Header>

          <Table.Body
            renderEmptyState={() => (
              <div className="flex min-h-32 items-center justify-center text-sm text-default-500">
                {emptyMessage}
              </div>
            )}
          >
            {rows.map((item) => {
              const id = String(getRowId(item));

              return (
                <Table.Row key={id} id={id}>
                  {selectionMode !== "none" && (
                    <Table.Cell className="pe-0">
                      <Checkbox
                        aria-label={getRowLabel?.(item) ?? `Select row ${id}`}
                        slot="selection"
                        variant="secondary"
                      >
                        <Checkbox.Content>
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox.Content>
                      </Checkbox>
                    </Table.Cell>
                  )}

                  {columns.map((column) => (
                    <Table.Cell key={column.key}>
                      {column.render
                        ? column.render(item)
                        : String(readValue(item, column) ?? "")}
                    </Table.Cell>
                  ))}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

const DataGrid = React.memo(DataGridInner) as typeof DataGridInner;

export default DataGrid;
