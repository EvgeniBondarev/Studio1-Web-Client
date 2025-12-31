import {Layout} from 'antd';
import {useQuery} from '@tanstack/react-query';
import {findTreeByCode, getPartialTree, type TreeNode} from '../api/crossCode.ts';
import {useState} from 'react';
const {Content} = Layout;

export const CrossCodePage = () => {
  const [inputCode, setInputCode] = useState('');
  const [progress, setProgress] = useState(0);
  const [partialTree, setPartialTree] = useState<TreeNode[] | null>(null);

  const { data: tree, isLoading } = useQuery({
    queryKey: ['CrTCrosses', inputCode],
    queryFn: () => findTreeByCode(inputCode.trim(), (loaded, mainCode) => {
      setProgress(loaded);
      if (mainCode) {
        setPartialTree(getPartialTree(mainCode));
      }
    }),
    enabled: !!inputCode,
  });

  const renderTree = (node: TreeNode) => (
    <li key={node.label}>
      {node.label}
      {node.children.length > 0 && (
        <ul>
          {node.children.map(renderTree)}
        </ul>
      )}
    </li>
  );

  return (
    <Layout>
      <Content style={{padding: 24}}>
        <div style={{ padding: '20px' }}>
          <h2>Поиск кросс-кодов</h2>

          <input
            type="text"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              setPartialTree(null); // очищаем дерево при новом вводе
              setProgress(0);
            }}
            placeholder="Введите CrossCode"
            style={{ padding: '5px', marginRight: '10px' }}
          />

          <button onClick={() => setInputCode(inputCode)} disabled={!inputCode}>
            Найти
          </button>

          {isLoading && <p>Загрузка... Подгружено записей: {progress}</p>}

          {!isLoading && !partialTree && !tree && inputCode && (
            <p>Ничего не найдено</p>
          )}

          {(tree || partialTree) && (
            <ul>
              {(tree ?? partialTree!).map(renderTree)}
            </ul>
          )}

        </div>
      </Content>
    </Layout>
  );
};
