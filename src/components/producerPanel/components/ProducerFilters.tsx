import { Input, Select, Space } from 'antd';
import type {ProducerFilterMode} from '../ProducerPanel.tsx';


export const PRODUCER_FILTER_OPTIONS: {
  value: ProducerFilterMode;
  label: string;
}[] = [
  { value: 'all', label: 'Все производители' },
  { value: 'originals', label: 'Только оригинальные' },
  { value: 'non-originals', label: 'Не оригинальные' },
  { value: 'with-prefix', label: 'С заполненным префиксом' },
];

interface ProducerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchExternalChange?: (value: string) => void;
  externalSearch?: string;
  filterMode: ProducerFilterMode;
  onFilterModeChange: (value: ProducerFilterMode) => void;
}

export const ProducerFilters = ({
                                  search,
                                  onSearchChange,
                                  filterMode,
                                  onFilterModeChange,
                                }: ProducerFiltersProps) => {

  return (
    <Space.Compact style={{ width: '100%' }} className="panel-search">
      <Input.Search
        placeholder="Поиск по названию или префиксу"
        allowClear
        size="small"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        style={{ flex: 1 }}
      />
      <Select
        value={filterMode}
        onChange={onFilterModeChange}
        size="small"
        style={{ width: 70 }}
        popupMatchSelectWidth={false}
        styles={{ popup: { root: { width: 170 } } }}
        options={PRODUCER_FILTER_OPTIONS}
      />
    </Space.Compact>
  );
};