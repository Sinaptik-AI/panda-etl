import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import Chip from './Chip';

interface TextInputProps {
  placeholder?: string;
  onUpdate: (items: string[]) => void;
  validate_text?: (value: string) => string|null;
}

interface TextInputState {
  inputValue: string;
  items: string[];
  error: string;
}

const MultiSelectionTextArea: React.FC<TextInputProps> = ({ placeholder = 'Type here...', onUpdate, validate_text }) => {
  const [state, setState] = useState<TextInputState>({
    inputValue: '',
    items: [],
    error: '',
  });

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setState({ ...state, inputValue: event.target.value });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault(); // Prevent default behavior

      const { inputValue, items } = state;
      const values = inputValue.split(',').map(value => value.trim()).filter(value => value !== '');

      let newItems = [...items];
      let error = '';

      for (const value of values) {
        // Validate the input value if validate_text function is provided
        if (validate_text) {
          const validationError = validate_text(value);
          if (validationError) {
            error = validationError;
            break; // Stop processing if there's a validation error
          }
        }
        newItems = [...newItems, value];
      }

      if (error) {
        setState({ ...state, error });
        return;
      }

      // Clear the error message and add the input values to items if they pass validation
      setState({
        inputValue: '',
        items: newItems,
        error: '', // Clear error if validation is successful
      });
      onUpdate(newItems); // Call the onUpdate callback with the updated list
    }
  };

  const handleDelete = (index: number) => {
    const newItems = state.items.filter((_, i) => i !== index);
    setState({ ...state, items: newItems });
    onUpdate(newItems); // Call the onUpdate callback with the updated list
  };

  return (
    <div>
      <textarea
        value={state.inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        className="border rounded p-2 w-full text-black"
      />
      {state.error && (
        <div className="text-red-500 mt-2">{state.error}</div> // Error message below the text area
      )}
      <div className="mt-3">
        {state.items.map((item, index) => (
          <Chip
            key={index}
            label={item}
            onDelete={() => handleDelete(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default MultiSelectionTextArea;
