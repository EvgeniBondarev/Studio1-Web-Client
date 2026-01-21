import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoadingOutlined, FileImageOutlined, ExclamationCircleOutlined, CloseOutlined } from '@ant-design/icons';
import {Spin, Image as AntdImage, Typography, Alert, Space} from 'antd';
import type {ImageDto} from '../../../api/TecDoc/api/types.ts';
import {imageService} from '../../../api/TecDoc/api/services/image.service.ts';

interface ArticleImageProps {
  image: ImageDto;
  supplierId: number;
}

export const ArticleImage=({ image, supplierId }: ArticleImageProps)=> {
  const [imageError, setImageError] = useState(false);
  const [showFullSize, setShowFullSize] = useState(false);

  const { data: imageInfo, isLoading, error } = useQuery({
    queryKey: ['articleImage', supplierId, image.pictureName],
    queryFn: () => imageService.getImageInfo(supplierId, image.pictureName),
    enabled: !!image.pictureName && !imageError,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  if (error || imageError) {
    return (
      <Alert
        title={<Typography.Text >Изображение недоступно</Typography.Text>}
        description={
          <Space orientation="vertical" size={1}>
            <Typography.Text >
              {image.description}
            </Typography.Text>

            {image.pictureName && (
              <Typography.Text
                type="secondary"
              >
                Файл: {image.pictureName}
              </Typography.Text>
            )}
          </Space>
        }
        type="info"
        showIcon
        icon={<ExclamationCircleOutlined />}
        style={{padding:10, width:'100%'}}
      />
    );
  }

  return (
    <div style={{
      border: '1px solid #f0f0f0',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      transition: 'box-shadow 0.3s'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <p style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#262626',
          margin: 0
        }}>
          {image.description}
        </p>
        {image.additionalDescription && (
          <p style={{
            fontSize: 11,
            color: '#8c8c8c',
            margin: '4px 0 0 0'
          }}>
            {image.additionalDescription}
          </p>
        )}
        {image.pictureName && (
          <p style={{
            fontSize: 11,
            fontFamily: 'monospace',
            color: '#bfbfbf',
            margin: '4px 0 0 0'
          }}>
            Файл: {image.pictureName}
          </p>
        )}
      </div>

      {isLoading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '192px',
          backgroundColor: '#fafafa',
          borderRadius: '8px'
        }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#1890ff' }} spin />} />
        </div>
      ) : imageInfo?.url ? (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              minHeight: '200px'
            }}
            onClick={() => setShowFullSize(true)}
          >
            <AntdImage
              src={imageInfo.url}
              alt={image.description || image.pictureName || 'Изображение артикула'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              preview={false}
              onError={() => setImageError(true)}
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.3s'
            }}>
              <span style={{
                fontSize: 10,
                color: '#fff',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '4px 8px',
                borderRadius: '4px',
                opacity: 0,
                transition: 'opacity 0.3s'
              }}>
                Нажмите для увеличения
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '192px',
          backgroundColor: '#fafafa',
          borderRadius: '8px',
          color: '#d9d9d9'
        }}>
          <FileImageOutlined style={{ fontSize: 32 }} />
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        marginTop: '12px'
      }}>
        {image.showImmediately && (
          <span style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: '10px',
            backgroundColor: '#f6ffed',
            color: '#52c41a',
            border: '1px solid #b7eb8f'
          }}>
            Показывать сразу
          </span>
        )}
        {image.documentName && (
          <span style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: '10px',
            backgroundColor: '#e6f7ff',
            color: '#1890ff',
            border: '1px solid #91d5ff'
          }}>
            Документ: {image.documentName}
          </span>
        )}
        {image.documentType && (
          <span style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: '10px',
            backgroundColor: '#fafafa',
            color: '#8c8c8c',
            border: '1px solid #d9d9d9'
          }}>
            Тип: {image.documentType}
          </span>
        )}
      </div>

      {showFullSize && imageInfo?.url && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000
          }}
          onClick={() => setShowFullSize(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '1200px',
              maxHeight: '90vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFullSize(false)}
              style={{
                position: 'absolute',
                top: '-48px',
                right: 0,
                color: '#fff',
                backgroundColor: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                padding: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}
              aria-label="Закрыть"
            >
              <CloseOutlined style={{ fontSize: 16 }} />
            </button>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%'
            }}>
              <img
                src={imageInfo.url}
                alt={image.description || image.pictureName || 'Изображение артикула'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}