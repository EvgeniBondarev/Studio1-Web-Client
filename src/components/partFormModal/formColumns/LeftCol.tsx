import {Form, Input} from 'antd';

export const LeftCol = () => (
    <>
        <Form.Item
            name="Code"
            label="Короткий код"
            rules={[{required: true, message: 'Укажите короткий код'}]}
        >
            <Input/>
        </Form.Item>
        <Form.Item name="LongCode" label="Литературный код">
            <Input/>
        </Form.Item>
        <Form.Item name="DescriptionText" label="Описание">
            <Input.TextArea rows={4} placeholder="Описание не заполнено"/>
        </Form.Item>
    </>
);