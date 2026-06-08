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
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px' }}>
          <img src={food.image || `https://picsum.photos/seed/food${food.id}/800/450`} alt={food.image_alt || food.name} style={{width: '100%', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.08)'}} />
          <div style={{ marginTop: 8, color: '#666', fontSize: 14 }}>{food.image_alt || ''}</div>
        </div>

        <div style={{ flex: '1 1 320px' }}>
          <h1 style={{ marginTop: 0 }}>{food.name}</h1>
          <p style={{ color: '#666' }}>{food.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            <div><strong>分類</strong><div>{food.category}</div></div>
            <div><strong>地區</strong><div>{food.region}</div></div>
            <div><strong>價格範圍</strong><div>{food.price_range || '—'}</div></div>
            <div><strong>卡路里</strong><div>{food.calories ? `${food.calories} kcal` : '—'}</div></div>
            <div style={{ gridColumn: '1 / -1' }}><strong>推薦吃法 / 亮點</strong><div>{food.eating_tips || food.tips || '—'}</div></div>
            <div style={{ gridColumn: '1 / -1' }}><strong>常見夜市</strong><div>{(food.night_markets || []).join('、') || '—'}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
