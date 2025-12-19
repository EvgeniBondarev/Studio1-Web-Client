import {Descriptions} from 'antd';
import type {ProductAttribute} from '../../../../../../api/types.ts';

type Props={
    attributes: ProductAttribute[]
}

export const PRAttributes = ({ attributes }: Props) => {
      return (
        <Descriptions column={1} size="small" bordered>
            {attributes.map((attr) => (
                <Descriptions.Item
                    key={attr.Id}
                    label={attr.Attribute.Name}
                >
                    {attr.Value}
                </Descriptions.Item>
            ))}
        </Descriptions>
    );
};
