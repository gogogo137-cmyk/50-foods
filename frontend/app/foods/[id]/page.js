import React from 'react';

async function getFood(id) {
  const res = await fetch(`http://localhost:8000/api/food/delicacies/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function Page({ params }) {
  const { id } = params;
  const food = await getFood(id);

  if (!food) {
    return <div style={{ padding: 20 }}>找不到該食物（ID: {id}）</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{food.name}</h1>
      <img src={food.image || `https://picsum.photos/seed/food${food.id}/800/450`} alt={food.name} style={{maxWidth: '100%', borderRadius: 10, margin: '12px 0'}} />
      <p><strong>分類：</strong>{food.category} • <strong>地區：</strong>{food.region}</p>
      <p>{food.description}</p>
      <h3>推薦吃法 / 亮點</h3>
      <p>{food.tips || '—'}</p>
    </div>
  );
}
