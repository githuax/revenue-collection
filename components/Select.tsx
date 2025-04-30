import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  onChange: (selectedValues: string[]) => void;
}

const Select: React.FC<SelectProps> = ({ options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (value: string) => {
    let updatedValues;
    if (selectedValues.includes(value)) {
      updatedValues = selectedValues.filter((v) => v !== value);
    } else {
      updatedValues = [...selectedValues, value];
    }
    setSelectedValues(updatedValues);
    onChange(updatedValues);
  };

  const renderOption = ({ item }: { item: Option }) => (
    <Pressable
      style={styles.option}
      onPress={() => handleCheckboxChange(item.value)}
    >
      <Text style={styles.optionText}>
        {selectedValues.includes(item.value) ? '✓ ' : ''}{item.label}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.button}>
        <Text style={styles.buttonText}>
          {selectedValues.length > 0
            ? `${selectedValues.length} selected`
            : 'Select items'}
        </Text>
      </TouchableOpacity>
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleDropdown}
      >
        <Pressable style={styles.overlay} onPress={toggleDropdown}>
          <View style={styles.dropdown}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={renderOption}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  button: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    maxHeight: '50%',
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
  },
});

export default Select;