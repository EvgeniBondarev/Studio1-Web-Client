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
                width: '30%',
                maxWidth: '400px',
                minHeight: '200px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                overflow:'hidden'
            }}
            onClick={() => onClick(img)}
        >
            {!loaded && <Spin />}
            <img
                alt={`product image`}
                style={{
                    width: '100%',
                    height: '100%',
                    display: loaded ? 'block' : 'none',
                    objectFit: 'contain',
                }}
                src={img}
                onLoad={() => setLoaded(true)}
            />
        </div>
    );
};
