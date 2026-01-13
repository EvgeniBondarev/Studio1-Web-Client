import {Typography} from 'antd'
import type {EtProducer} from '../../../api/types.ts';
import {ProducerDetailsHeader} from './ProducerDetailsHeader.tsx';
import {ProducerDetailsForm} from './ProducerDetailsForm.tsx';

interface ProducerDetailsContentProps {
  producer?: EtProducer | null
  onSelectProducer?: (producerId: number) => void
}

export const ProducerDetailsCard = ({
                                      producer,
                                      onSelectProducer,
                                    }: ProducerDetailsContentProps) => {
  if (!producer) {
    return (
      <Typography.Text type="secondary">
        Выберите производителя для просмотра информации
      </Typography.Text>
    )
  }

  const isNonOriginal =
    producer.RealId !== undefined &&
    producer.RealId !== null &&
    producer.RealId !== producer.Id

  return (
    <>
      <ProducerDetailsHeader
        name={producer.Name}
        onSelectProducer={onSelectProducer}
        isNonOriginal={isNonOriginal}
        realId={producer.RealId}
      />

      <ProducerDetailsForm
        producer={producer}
        isNonOriginal={isNonOriginal}
      />
    </>
  )
}