import {Col, Empty, Form, type FormInstance, Input, Row, Tabs} from 'antd'

import {DataTab} from './dataTab/DataTab'
import {ImagesTab} from './imageTab/ImagesTab'
import {LeftCol} from './formColumns/LeftCol'
import {RightCol} from './formColumns/RightCol'
import {DetailsTab} from './detailsTab/DetailsTab'
import type {CtSession, EtPart, PRResponse} from '../../../api/types.ts';
import {usePartStrings} from '../../hooks/usePartStrings.tsx';
import dayjs from 'dayjs';
import {useEffect} from 'react';
import type {EtPartForm} from '../../partsPanel/components/PartFormModal.tsx';
import type {ImageDto, SupplierInfoDto, ArticleInfoDto, AttributeDto} from '../../../api/TecDoc/api/types.ts';
import {Characteristics, MainInfo} from '../tecDoc/articleDetails';
import {useFilteredAttributes} from '../../tecDocPage/useFilteredAttributes.ts';

interface PartFormCardProps {
  initialValues?: Partial<EtPart>
  form: FormInstance<EtPartForm>
  activeTab: string
  setActiveTab: (tab: string) => void
  selectedSession?: CtSession
  PRdata?: PRResponse
  isPRLoading: boolean
  readOnly?: boolean
  tecDocImg?: ImageDto[]
  article?: ArticleInfoDto
  supplier?: SupplierInfoDto
  attributes?: AttributeDto[]
}

export const PartFormCard = ({
                               initialValues,
                               form,
                               activeTab,
                               setActiveTab,
                               selectedSession,
                               PRdata,
                               isPRLoading,
                               tecDocImg,
                               supplier,
                               article,
                               attributes,
                               readOnly
                             }: PartFormCardProps) => {

  const {getText} = usePartStrings(initialValues?.ProducerId, [initialValues?.Name, initialValues?.Description])

  const hasTecDocProps =
    article !== undefined ||
    supplier !== undefined ||
    attributes !== undefined;

  const safeAttributes = attributes ?? [];

  const hasTecDocContent =
    !!article ||
    !!supplier ||
    (safeAttributes?.length ?? 0) > 0;

  useEffect(() => {
    if (!initialValues) {
      form.resetFields()
      return
    }

    const description = getText(initialValues.Name)
    form.setFieldsValue({
      ...initialValues,
      DescriptionText: (description && typeof description === 'string') ? description : ''
    })
  }, [initialValues, getText, form])


  const formatSessionDate = (value?: string) => {
    if (!value) return '—'
    const parsed = dayjs(value)
    return parsed.isValid() ? parsed.format('DD.MM.YYYY HH:mm') : value
  }

  // `DetailsTab` ожидает строковые значения, а не объект целиком.
  // "Файл импорта" соответствует `CtSession.Source`.
  const fileImportValue = selectedSession?.Source ?? '—'
  const importDateValue = selectedSession ? formatSessionDate(selectedSession.Start) : '—'

  const {
    filteredAttributes,
    search: attributesSearch,
    setSearch: setAttributesSearch
  } =
    useFilteredAttributes(safeAttributes);

  const tabsConfig = [
    {
      key: 'details',
      label: 'Деталь',
      content: <DetailsTab fileImportValue={fileImportValue}
                           importDateValue={importDateValue}/>
    },
    {
      key: 'images',
      label: 'Изображение',
      content: <ImagesTab prImages={PRdata?.Images}
                          prIsLoading={isPRLoading}
                          code={initialValues?.Code ?? ''}
                          producerId={initialValues?.ProducerId?.toString() ?? ''}
                          tecDocImg={tecDocImg}
      />
    },
    {
      key: 'pr_data',
      label: 'PR Данные',
      content: <DataTab attributes={PRdata?.Attributes}
                        categories={PRdata?.VendorCategories}/>
    },
    ...(hasTecDocProps
      ? [
        {
          key: 'tecDoc_data',
          label: 'TecDoc',
          content: (
            <>
              {hasTecDocContent ? (
                <>
                  {article && supplier && (
                    <MainInfo article={article} supplier={supplier} />
                  )}

                  {safeAttributes.length > 0 && (
                    <Characteristics
                      filteredAttributes={filteredAttributes}
                      attributesSearch={attributesSearch}
                      attributesLength={attributes?.length ?? 0}
                      setAttributesSearch={setAttributesSearch}
                    />
                  )}
                </>
              ) : (
                <Empty description="Данные TecDoc не найдены" />
              )}
            </>
          ),
        },
      ]
      : [])
    ,
  ]

  return (
    <Form layout="vertical" form={form}>
      <Form.Item name="SessionId" hidden>
        <Input/>
      </Form.Item>
      <Row gutter={16}>
        <Col span={14}>
          <LeftCol readOnly={readOnly}/>
        </Col>
        <Col span={10}>
          <RightCol readOnly={readOnly}/>
        </Col>
      </Row>
      <div style={{
        minHeight: 300, overflowY: 'auto',
        overflowX: 'hidden', marginBottom: '20px'
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabsConfig.map(tab => ({
            key: tab.key,
            label: tab.label,
            children: tab.content,
          }))}
        />
      </div>
    </Form>
  )
}
