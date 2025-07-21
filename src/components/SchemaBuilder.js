import React, { useState } from 'react';

// Generates a new empty field object
const createNewField = () => ({
  id: Date.now() + Math.random(), // unique key
  key: '',
  type: 'string',
  children: [],
});

// Changed from 'const SchemaBuilder = ...' to 'function SchemaBuilder(...)'
function SchemaBuilder({ fields = [], onChange }) {
  const [localFields, setLocalFields] = useState(fields.length ? fields : [createNewField()]);

  // Notify parent if onChange is passed
  const updateParent = (updatedFields) => {
    setLocalFields(updatedFields);
    if (onChange) onChange(updatedFields);
  };

  const handleFieldChange = (index, key, value) => {
    const updated = [...localFields];
    updated[index][key] = value;

    // Reset children if type changed away from 'nested'
    if (key === 'type' && value !== 'nested') {
      updated[index].children = [];
    }

    updateParent(updated);
  };

  const handleAddField = () => {
    updateParent([...localFields, createNewField()]);
  };

  const handleRemoveField = (index) => {
    const updated = localFields.filter((_, i) => i !== index);
    updateParent(updated);
  };

  const handleNestedChange = (index, children) => {
    const updated = [...localFields];
    updated[index].children = children;
    updateParent(updated);
  };

  // Recursive function to build JSON from fields
  const buildJson = (fields) => {
    const result = {};
    fields.forEach((field) => {
      if (!field.key) return;

      if (field.type === 'nested') {
        result[field.key] = buildJson(field.children || []);
      } else {
        result[field.key] = field.type === 'string' ? '' : 0;
      }
    });
    return result;
  };

  return (
    <div className="schema-builder">
      <div className="fields-section">
        {localFields.map((field, index) => (
          <div key={field.id} className="field-row">
            <input
              type="text"
              placeholder="Key"
              value={field.key}
              onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
            />

            <select
              value={field.type}
              onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="nested">Nested</option>
            </select>

            <button onClick={() => handleRemoveField(index)}>❌</button>

            {field.type === 'nested' && (
              <div className="nested-fields">
                {/* This recursive call will now work correctly */}
                <SchemaBuilder
                  fields={field.children}
                  onChange={(children) => handleNestedChange(index, children)}
                />
              </div>
            )}
          </div>
        ))}

        <button className="add-btn" onClick={handleAddField}>+ Add Field</button>
      </div>

      <div className="json-preview">
        <h3>Live JSON Preview</h3>
        <pre>{JSON.stringify(buildJson(localFields), null, 2)}</pre>
      </div>
    </div>
  );
}

export default SchemaBuilder;
