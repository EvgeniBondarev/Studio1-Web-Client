import { Form, InputNumber, Checkbox } from 'antd';

export const RightCol = () => (
    <>
        <Form.Item name="Rating" label="Рейтинг">
            <InputNumber style={{ width: '100%' }} min={0} max={10} />
        </Form.Item>
        <Form.Item name="Accepted" valuePropName="checked">
            <Checkbox>Проверена</Checkbox>
        </Form.Item>
        <Form.Item name="NoChangeFlag" valuePropName="checked">
            <Checkbox>Узел проверен</Checkbox>
        </Form.Item>
        <Form.Item name="Old" valuePropName="checked">
            <Checkbox>Устарела</Checkbox>
        </Form.Item>
        <Form.Item name="Dead" valuePropName="checked">
            <Checkbox>Не производится</Checkbox>
        </Form.Item>
    </>
);