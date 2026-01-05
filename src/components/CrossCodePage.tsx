import {Layout, Tree, Input, Spin, Empty, message} from 'antd'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useState} from 'react'
import {findTreeByCode, type CrossTree} from '../api/crossCode'
import {useFormatDate} from './hooks/useFormatDate.ts';

const {Content} = Layout

export const CrossCodePage = () => {
  const [inputValue, setInputValue] = useState('')
  const [mainCode, setMainCode] = useState('')
  const { formatDate } = useFormatDate();

  useEffect(() => {
    const handler = setTimeout(() => {
      setMainCode(inputValue.trim())
    }, 1000)

    return () => clearTimeout(handler)
  }, [inputValue])

  const { data: tree, isLoading, isFetching } = useQuery<CrossTree | null>({
    queryKey: ['cross-tree', mainCode],
    queryFn: async ({ signal }) => {
      try {
        return await findTreeByCode(mainCode, signal)
      } catch (e) {
        message.error('Ошибка загрузки кросс-кодов')
        throw e
      }
    },
    enabled: !!mainCode.trim(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })

  return (
    <Layout>
      <Content style={{padding: 24, maxWidth: 800}}>
        <h2>Поиск кросс-кодов</h2>

        <Input.Search
          placeholder="Введите MainCode"
          allowClear
          enterButton="Найти"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onSearch={value => setMainCode(value.trim())}
          style={{ marginBottom: 20 }}
        />

        {isLoading || isFetching ? (
          <Spin/>
        ) : !tree ? (
          <Empty description="Ничего не найдено"/>
        ) : (
          <Tree
            defaultExpandAll
            showLine

            treeData={[
              {
                key: tree.mainCode,
                title: <b>{tree.mainCode}</b>,
                children: tree.brands.map(brand => ({
                  key: brand.brandId,
                  title: `Производитель ${brand.brandId}`,
                  children: brand.codes.map(code => ({
                    key: code.id,
                    title: (
                      <div style={{ display: 'flex', width: 500}}> {/* можно ширину дерева или maxWidth */}
                        <div style={{ flex: 1 }}>{code.code}</div>
                        <div style={{ width: 80, textAlign: 'right'}}>{code.verity}%</div>
                        <div style={{ width: 200, textAlign: 'right'}}>{formatDate(code.date)}</div>
                      </div>
                    )

                  }))
                }))
              }
            ]}
          />
        )}
      </Content>
    </Layout>
  )
}
