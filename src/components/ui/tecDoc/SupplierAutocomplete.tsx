import React, {useState, useEffect, useRef} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Input, Spin, List, Typography, Empty} from 'antd';
import {BankOutlined, CloseOutlined} from '@ant-design/icons';
import type {SupplierDocument} from '../../../api/TecDoc/api/types.ts';
import {supplierSearchService} from '../../../api/TecDoc/api/services/supplier-search.service.ts';

const {Text} = Typography;

// Debounce hook
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


interface Props {
  value?: number | null
  onChange: (supplierId: number | undefined) => void
  onSupplierSelect?: (supplier: SupplierDocument) => void
  placeholder?: string
}

const SupplierAutocomplete = ({
                                value,
                                onChange,
                                onSupplierSelect,
                                placeholder = 'Поиск поставщика по имени...',
                              }:Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDocument | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce поискового запроса
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Поиск поставщиков при вводе
  const {data: searchResults, isLoading: isSearching} = useQuery({
    queryKey: ['supplierAutocomplete', debouncedSearchQuery],
    queryFn: () =>
      supplierSearchService.search({
        query: debouncedSearchQuery || null,
        page: 1,
        pageSize: 10,
        sortBy: 'relevance',
      }),
    enabled: debouncedSearchQuery.length > 0 && isOpen,
    staleTime: 2 * 60 * 1000,
  });

  // Загрузка выбранного поставщика по ID при инициализации
  const {data: initialSupplierData} = useQuery({
    queryKey: ['supplierById', value],
    queryFn: async () => {
      if (!value) return null;
      try {
        // Используем API для получения поставщика по ID
        const {supplierService} = await import('../../../api/TecDoc/api/services/supplier.service.ts');
        const supplierDetail = await supplierService.getById(value);
        if (supplierDetail?.supplier) {
          return {
            id: supplierDetail.supplier.id.toString(),
            supplierId: supplierDetail.supplier.id,
            description: supplierDetail.supplier.description,
            matchcode: supplierDetail.supplier.matchcode,
            nbrOfArticles: supplierDetail.supplier.nbrOfArticles,
            dataVersion: supplierDetail.supplier.dataVersion?.toString(),
            indexedAt: new Date().toISOString(), // Используем текущую дату, так как это поле не возвращается API
          }  as SupplierDocument
        }
      } catch (e) {
        // Если не удалось получить через API, пытаемся найти через поиск
        const result = await supplierSearchService.search({
          query: null,
          page: 1,
          pageSize: 1000,
          sortBy: 'description',
        });
        return result.items.find((s) => s.supplierId === value) || null;
      }
      return null;
    },
    enabled: !!value && !selectedSupplier,
    staleTime: 10 * 60 * 1000, // 10 минут
  });

  useEffect(() => {
    if (initialSupplierData && value === initialSupplierData.supplierId) {
      setSelectedSupplier(initialSupplierData);
      setSearchQuery(initialSupplierData.description);
    } else if (!value && selectedSupplier) {
      // Если value стал null/undefined, очищаем выбор
      setSelectedSupplier(null);
      setSearchQuery('');
    } else if (value && !initialSupplierData && !selectedSupplier) {
      // Если value изменился, но данные еще не загружены, сбрасываем состояние
      setSelectedSupplier(null);
      setSearchQuery('');
    }
  }, [initialSupplierData, value, selectedSupplier]);

  useEffect(() => {
    const handleClickOutside = (e:MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSupplier = (supplier:SupplierDocument) => {
    setSelectedSupplier(supplier);
    setSearchQuery(supplier.description);
    onChange(supplier.supplierId);
    if (onSupplierSelect) {
      onSupplierSelect(supplier);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedSupplier(null);
    setSearchQuery('');
    onChange(undefined);
    setIsOpen(false);
  };

  const handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setIsOpen(true);
    if (!newValue) {
      onChange(undefined);
      setSelectedSupplier(null);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const suppliers = searchResults?.items || [];

  const listItemStyle = {
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  };

  const selectedItemStyle = {
    ...listItemStyle,
    backgroundColor: '#e6f7ff',
  };

  return (
    <div ref={containerRef} style={{ position: 'relative',}}>
      <div style={{position: 'relative'}}>
        <BankOutlined style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '16px',
          color: '#bfbfbf',
          zIndex: 1,}}/>
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          style={{paddingLeft: '40px', paddingRight: '40px'}}
        />
        {selectedSupplier && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#bfbfbf',
              zIndex: 1,
            }}
          >
            <CloseOutlined/>
          </button>
        )}
      </div>

      {/* Выпадающий список */}
      {isOpen && (
        <div style={{position: 'absolute',
          width: '100%',
          marginTop: '4px',
          backgroundColor: 'white',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
          maxHeight: '240px',
          overflow: 'auto',
          zIndex: 1000,}}>

          {isSearching && (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              color: '#8c8c8c',
              fontSize: '14px',
            }}>
              <Spin size="small" style={{marginRight: '8px'}}/>
              Поиск...
            </div>
          )}

          {!isSearching && debouncedSearchQuery && suppliers.length === 0 && (
            <Empty
            description={'Поставщики не найдены'}
            />
          )}

          {!isSearching && suppliers.length > 0 && (
            <List
              size="small"
              dataSource={suppliers}
              renderItem={(supplier) => (
                <List.Item
                  style={
                    selectedSupplier?.supplierId === supplier.supplierId
                      ? selectedItemStyle
                      : listItemStyle
                  }
                  onClick={() => handleSelectSupplier(supplier)}
                >
                  <div style={{width: '100%'}}>
                    <div style={{fontWeight: 500, color: '#262626'}}>
                      {supplier.description}
                    </div>
                    {supplier.matchcode && (
                      <Text type="secondary" style={{fontSize: '14px'}}>
                        Код: {supplier.matchcode}
                      </Text>
                    )}
                    {supplier.nbrOfArticles !== undefined && (
                      <div style={{fontSize: '12px', color: '#8c8c8c', marginTop: '2px'}}>
                        Артикулов: {supplier.nbrOfArticles.toLocaleString()}
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
            />
          )}

          {!isSearching && !searchQuery && (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              color: '#8c8c8c',
              fontSize: '14px',
            }}>
              Начните вводить название поставщика
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupplierAutocomplete;