import React from 'react';
import DropdownComponent from './DropDown';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  isSearchable?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  onChange,
  placeholder = 'Select items',
  searchPlaceholder = 'Search...',
  isSearchable = true,
}) => {
  const handleChange = (item: Option) => {
    onChange([item.value]);
  };

  return (
    <DropdownComponent
      data={options}
      onChange={handleChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      isSearchable={isSearchable}
    />
  );
};

export default Select;