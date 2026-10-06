import {
  Label,
  ListBox,
  Select,
} from "@heroui/react";

interface ISelectBoxProps {
  name: string;
  items: string[];
  value?: string;
  onChange: (value: string) => void;
  showAll?: boolean;
}

const SelectBox = ({
  name,
  items,
  value = "",
  onChange,
  showAll = true,
}: ISelectBoxProps) => {
  const handleChange = (value: string | null) => {
    onChange(value ?? "");
  };

  return (
    <Select
      className="flex-1"
      value={value}
      onChange={(value)=>handleChange(value as string)}
    >
      <Label>{name}</Label>

      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>

      <Select.Popover>
        <ListBox>
          {showAll && (
            <ListBox.Item
              id="All"
              textValue="All"
            >
              All
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}

          {items.map((item) => (
            <ListBox.Item
              key={item}
              id={item}
              textValue={item}
            >
              {item}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};

export default SelectBox;