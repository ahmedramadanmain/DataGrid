import { Checkbox, Table } from "@heroui/react";
import {
  useEffect,
  useMemo,
  useState,
  type Key,
  type ReactNode,
} from "react";

export interface IDataGridColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

export type SelectionMode =
  | "none"
  | "single"
  | "multiple"
  | "all";

interface IDataGridProps<T> {
  data: T[];
  columns: IDataGridColumn<T>[];
  getRowId: (item: T) => string | number;
  selectionMode?: SelectionMode;
  getRowLabel?: (item: T) => string;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  className?: string;
  emptyMessage?: string;
}

function DataGrid<T>({
  data,
  columns,
  getRowId,
  selectionMode = "none",
  getRowLabel,
  onSelectionChange,
  className = "min-w-[900px]",
  emptyMessage = "No data found.",
}: IDataGridProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set(),
  );

  const rowKeys = useMemo(
    () => new Set(data.map((item) => String(getRowId(item)))),
    [data, getRowId],
  );

  useEffect(() => {
    if (selectionMode === "none") {
      setSelectedKeys(new Set());
      return;
    }

    if (selectionMode === "all") {
      const allKeys = new Set(rowKeys);

      setSelectedKeys(allKeys);
      onSelectionChange?.(allKeys);
      return;
    }

    setSelectedKeys((currentKeys) => {
      const validKeys = new Set(
        [...currentKeys].filter((key) => rowKeys.has(key)),
      );

      if (selectionMode === "single" && validKeys.size > 1) {
        const firstKey = validKeys.values().next().value;

        return firstKey
          ? new Set([firstKey])
          : new Set();
      }

      return validKeys;
    });
  }, [selectionMode, rowKeys, onSelectionChange]);

  const handleSelectionChange = (keys: "all" | Set<Key>) => {
    if (keys === "all") {
      const allKeys = new Set(rowKeys);

      setSelectedKeys(allKeys);
      onSelectionChange?.(allKeys);

      return;
    }

    const selectedKeys = new Set(
      [...keys].map(String),
    );

    if (selectionMode === "single") {
      const selectedKey = [...selectedKeys].at(-1);

      const nextKeys = selectedKey
        ? new Set([selectedKey])
        : new Set<string>();

      setSelectedKeys(nextKeys);
      onSelectionChange?.(nextKeys);

      return;
    }

    setSelectedKeys(selectedKeys);
    onSelectionChange?.(selectedKeys);
  };

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          className={className}
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

            {columns.map((column) => (
              <Table.Column
                key={column.key}
                id={column.key}
              >
                {column.label}
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
            {data.map((item) => {
              const id = String(getRowId(item));

              return (
                <Table.Row key={id} id={id}>
                  {selectionMode !== "none" && (
                    <Table.Cell className="pe-0">
                      <Checkbox
                        aria-label={
                          getRowLabel?.(item) ??
                          `Select row ${id}`
                        }
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
                        : String(
                            (item as Record<string, unknown>)[
                              column.key
                            ] ?? "",
                          )}
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

export default DataGrid;