import { useMemo, useState } from 'react';

export function useFilteredAttributes(attributes: Array<any>, initialSearch = '', globalSearch?: string) {
  const [search, setSearch] = useState(initialSearch);

  const filtered = useMemo(() => {
    const queryString = (globalSearch || search).trim().toLowerCase();
    if (!queryString) return attributes;

    return attributes.filter(attr => {
      return (
        attr.description.toLowerCase().includes(queryString) ||
        attr.displayTitle.toLowerCase().includes(queryString) ||
        attr.displayValue.toLowerCase().includes(queryString) ||
        attr.id.toString().includes(queryString)
      );
    });
  }, [attributes, search, globalSearch]);

  return { filteredAttributes: filtered, search, setSearch };
}
