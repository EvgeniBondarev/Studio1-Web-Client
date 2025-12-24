import {Typography} from 'antd';
import {ArrowUpOutlined, ArrowDownOutlined} from '@ant-design/icons';
import type {SortField} from '../ProducerPanel.tsx';

interface Props {
  sortField: SortField | null;
  sortOrder: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}

export const ProducerListHeader = ({sortField, sortOrder, onSort}: Props) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return null;
    }
    return sortOrder === 'asc' ? (
      <ArrowUpOutlined style={{fontSize: 10, marginLeft: 4}}/>
    ) : (
      <ArrowDownOutlined style={{fontSize: 10, marginLeft: 4}}/>
    );
  };

  return (
    <div className="producer-row producer-row--header">
      <Typography.Text
        className="producer-row__cell producer-row__cell--prefix"
        type="secondary"
        style={{cursor: 'pointer', userSelect: 'none'}}
        onClick={() => onSort('prefix')}
      >
        Префикс {renderSortIcon('prefix')}
      </Typography.Text>
      <Typography.Text
        className="producer-row__cell producer-row__cell--name"
        type="secondary"
        style={{cursor: 'pointer', userSelect: 'none'}}
        onClick={() => onSort('name')}
      >
        Название {renderSortIcon('name')}
      </Typography.Text>
      <Typography.Text
        className="producer-row__cell producer-row__cell--count"
        type="secondary"
        style={{cursor: 'pointer', userSelect: 'none'}}
        onClick={() => onSort('count')}
      >
        Деталей {renderSortIcon('count')}
      </Typography.Text>
    </div>
  );
};