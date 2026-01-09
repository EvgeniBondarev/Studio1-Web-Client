import { Form, InputNumber, Checkbox, Typography } from 'antd';
const { Text } = Typography;

type Props = {
  readOnly?: boolean;
};

const checkboxes = [
  { name: 'Accepted', label: 'Проверена' },
  { name: 'NoChangeFlag', label: 'Узел проверен' },
  { name: 'Old', label: 'Устарела' },
  { name: 'Dead', label: 'Не производится' },
];

export const RightCol = ({ readOnly }: Props) => (
  <>
    <Form.Item name="Rating" label="Рейтинг">
      <InputNumber
        readOnly={readOnly}
        style={{ width: '100%' }}
        min={0}
        max={10}
      />
    </Form.Item>

    {checkboxes.map((cb) => (
      <Form.Item key={cb.name} name={cb.name} valuePropName="checked">
        <Checkbox disabled={readOnly}>
          <Text>{cb.label}</Text>
        </Checkbox>
      </Form.Item>
    ))}
  </>
);
