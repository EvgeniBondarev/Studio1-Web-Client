import { Form, InputNumber, Descriptions, Row, Col } from 'antd';

type Props={
    fileImportValue:any
    importDateValue:any
}

export const DetailsTab = ({ fileImportValue, importDateValue }: Props) => {
    return (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="Weight" label="Вес, кг">
                        <InputNumber style={{ width: '100%' }} min={0} step={0.001} />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item name="V" label="Объём">
                        <InputNumber style={{ width: '100%' }} min={0} step={0.001} />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Сессия импорта">
                <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Файл импорта">{fileImportValue}</Descriptions.Item>
                    <Descriptions.Item label="Дата импорта">{importDateValue}</Descriptions.Item>
                </Descriptions>
            </Form.Item>
        </>
    );
};
