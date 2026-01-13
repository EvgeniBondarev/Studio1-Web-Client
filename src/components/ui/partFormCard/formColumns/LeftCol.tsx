import {Form, Input} from 'antd';

type Props={
  readOnly?:boolean
}

export const LeftCol = ({readOnly}:Props) => (
    <>
        <Form.Item
            name="Code"
            label="Короткий код"
            rules={[{required: true, message: 'Укажите короткий код'}]}
        >
            <Input readOnly={readOnly}/>
        </Form.Item>
        <Form.Item name="LongCode" label="Литературный код">
            <Input readOnly={readOnly}/>
        </Form.Item>
        <Form.Item name="DescriptionText" label="Описание">
            <Input.TextArea readOnly={readOnly} rows={4} placeholder="Описание не заполнено"/>
        </Form.Item>
    </>
);