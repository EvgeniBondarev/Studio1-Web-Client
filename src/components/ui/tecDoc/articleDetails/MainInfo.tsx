import {Card, Col, Divider, Row, Typography} from 'antd';
import type {ArticleInfoDto, SupplierInfoDto } from '../../../../api/TecDoc/api/types.ts';

const { Title, Text, Paragraph } = Typography;
type Props={
  article:  ArticleInfoDto
  supplier?:SupplierInfoDto
}

export const MainInfo=({article,supplier }:Props)=>{

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: value ? trueColor : falseColor,
          display: 'inline-block',
        }}
      />
        <Text style={{ fontSize: 13 }}>
          {label}: {value ? 'Да' : 'Нет'}
        </Text>
      </div>
    )
  }

  return (
    <Card>
      <Title level={3} style={{ marginBottom: 8 }}>
        {article.dataSupplierArticleNumber}
      </Title>

      {supplier && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Поставщик: {supplier.description}
          </Text>

          {supplier.matchcode && (
            <div>
              <Text type="secondary">
                Код: {supplier.matchcode}
              </Text>
            </div>
          )}

          {supplier.dataVersion && (
            <div>
              <Text type="secondary">
                Версия данных: {supplier.dataVersion}
              </Text>
            </div>
          )}

          {supplier.nbrOfArticles !== undefined && (
            <div>
              <Text type="secondary">
                Артикулов: {supplier.nbrOfArticles.toLocaleString()}
              </Text>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          Описание
        </Title>
        <Paragraph style={{ color: '#595959' }}>
          {article.normalizedDescription || article.description}
        </Paragraph>
      </div>

      {article.description &&
        article.description !== article.normalizedDescription && (
          <div style={{ marginBottom: 16 }}>
            <Title level={4} style={{ marginBottom: 8 }}>
              Дополнительное описание
            </Title>
            <Paragraph style={{ color: '#8c8c8c' }}>
              {article.description}
            </Paragraph>
          </div>
        )}

      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Text type="secondary">Found String:</Text>
          <div>
            <Text
              style={{
                fontFamily: 'monospace',
                fontSize: 13,
                color: '#262626',
              }}
            >
              {article.foundString}
            </Text>
          </div>
        </Col>

        {article.quantityPerPackingUnit !== undefined && (
          <Col span={12}>
            <Text type="secondary">Количество в упаковке:</Text>
            <div>
              <Text strong>
                {article.quantityPerPackingUnit} шт.
              </Text>
            </div>
          </Col>
        )}

        <Col span={12}>
          <Text type="secondary">Статус:</Text>
          <div>
            <Text strong>{article.articleStateDisplayValue}</Text>
          </div>
        </Col>

        <Col span={12}>
          <Text type="secondary">Supplier ID:</Text>
          <div>
            <Text strong>{article.supplierId}</Text>
          </div>
        </Col>
      </Row>

      <Divider />

      <div>
        <Title level={4} style={{ marginBottom: 16 }}>
          Флаги
        </Title>

        <Row gutter={[16, 12]}>
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