import {Card, Col, Divider, Row, Typography, Space, Flex} from 'antd';
import type {ArticleInfoDto, SupplierInfoDto} from '../../../../api/TecDoc/api/types.ts';

const {Title, Text} = Typography;
type Props = {
  article: ArticleInfoDto
  supplier?: SupplierInfoDto
}

export const MainInfo = ({article, supplier}: Props) => {

  function FlagItem({
                      label,
                      value,
                      trueColor = '#1890ff',
                      falseColor = '#d9d9d9',
                    }: {
    label: string
    value: boolean
    trueColor?: string
    falseColor?: string
  }) {
    return (
      <Flex gap={8} align={'center'}>
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: value ? trueColor : falseColor,
          display: 'inline-block',
        }}
      />
        <Text style={{fontSize: 12}}>
          {label}: {value ? 'Да' : 'Нет'}
        </Text>
      </Flex>
    )
  }

  return (
    <Card
      title={
        <Title level={3} style={{margin: 0}}>
          {article.dataSupplierArticleNumber}
        </Title>
      }
    >

      {supplier && (
        <div>
          <Space orientation="vertical" size={2} style={{marginBottom: 10}}>

            <Text type="secondary" style={{display: 'block'}}>
              Поставщик: {supplier.description}
            </Text>

            {supplier.matchcode && (
              <Text type="secondary">
                Код: {supplier.matchcode}
              </Text>
            )}

            {supplier.dataVersion && (
              <Text type="secondary">
                Версия данных: {supplier.dataVersion}
              </Text>
            )}

            {supplier.nbrOfArticles !== undefined && (
              <Text type="secondary">
                Артикулов: {supplier.nbrOfArticles.toLocaleString()}
              </Text>
            )}
          </Space>
        </div>
      )}

      <Space orientation="vertical" size={1}>
        <Title level={4} style={{margin: 0}}>
          Описание
        </Title>
        <Text type={'secondary'}>
          {article.normalizedDescription || article.description}
        </Text>
      </Space>

      {article.description &&
        article.description !== article.normalizedDescription && (
          <Space orientation="vertical" size={1}>
            <Title level={4} style={{margin: 0}}>
              Дополнительное описание
            </Title>
            <Text type={'secondary'}>
              {article.description}
            </Text>
          </Space>
        )}

      <Divider size={'small'}/>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Space orientation={'vertical'} size={1}>
            <Text type="secondary">Found String:</Text>
            <Text strong>
              {article.foundString}
            </Text>
          </Space>
        </Col>

        {article.quantityPerPackingUnit !== undefined && (
          <Col span={12}>
            <Space orientation={'vertical'} size={1}>
              <Text type="secondary">Количество в упаковке:</Text>
              <Text strong>
                {article.quantityPerPackingUnit} шт.
              </Text>
            </Space>
          </Col>
        )}

        <Col span={12}>
          <Space orientation={'vertical'} size={1}>
            <Text type="secondary">Статус:</Text>
            <Text strong>
              {article.articleStateDisplayValue}
            </Text>
          </Space>
        </Col>

        <Col span={12}>
          <Space orientation={'vertical'} size={1}>
            <Text type="secondary">Supplier ID:</Text>
            <Text strong>
              {article.supplierId}
            </Text>
          </Space>
        </Col>
      </Row>

      <Divider size={'small'}/>

      <div>
        <Title level={4}>Флаги</Title>

        <Row gutter={[16, 12]} style={{rowGap: 6}}>
          <Col span={8}>
            <FlagItem label="Валидный" value={article.flags.isValid}
                      trueColor="#52c41a"
                      falseColor="#ff4d4f"
            />
          </Col>

          <Col span={8}>
            <FlagItem label="Аксессуар" value={article.flags.flagAccessory}/>
          </Col>

          <Col span={8}>
            <FlagItem label="Сертификация" value={article.flags.flagMaterialCertification}/>
          </Col>

          <Col span={8}>
            <FlagItem label="Восстановленный" value={article.flags.flagRemanufactured}/>
          </Col>

          <Col span={8}>
            <FlagItem label="Самообслуживание" value={article.flags.flagSelfServicePacking}/>
          </Col>

          <Col span={8}>
            <FlagItem label="Легковой" value={article.flags.hasPassengerCar}/>
          </Col>

          <Col span={8}>
            <FlagItem label="Коммерческий" value={article.flags.hasCommercialVehicle}/>
          </Col>

          <Col span={8}>
            <FlagItem label="Мотоцикл" value={article.flags.hasMotorbike}/>
          </Col>

          <Col span={8}>
            <FlagItem label="Ось" value={article.flags.hasAxle}/>
          </Col>

          <Col span={8}>
            <FlagItem label="Двигатель" value={article.flags.hasEngine}/>
          </Col>

          <Col span={8}>
            <FlagItem label="Применимость" value={article.flags.hasLinkItems}/>
          </Col>
        </Row>
      </div>
    </Card>
  )
}