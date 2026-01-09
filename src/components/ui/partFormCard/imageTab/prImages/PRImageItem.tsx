import {Spin} from 'antd';
import {useState} from 'react';

type Props = {
    img: string;
    onClick: (link: string) => void
}

export const PRImageItem = ({ img, onClick } :Props) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            style={{
                position: 'relative',
                width: '30%',
                maxWidth: '400px',
                minHeight: '200px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
            }}
            onClick={() => onClick(img)}
        >
            {!loaded && <Spin />}
            <img
                alt={`product image`}
                style={{
                    width: '100%',
                    height: 'auto',
                    display: loaded ? 'block' : 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    objectFit: 'contain',
                }}
                src={img}
                onLoad={() => setLoaded(true)}
            />
        </div>
    );
};
