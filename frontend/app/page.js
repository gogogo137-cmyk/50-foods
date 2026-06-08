"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import Image from "next/image";

function FoodCard({ food }) {
  return (
    <Link href={`/foods/${food.id}`} className={styles.card}>
      <div className={styles.cardLeft}>
        <div className={styles.emoji}>{food.emoji || '🍽️'}</div>
        <div>
          <h3 className={styles.title}>{food.name}</h3>
          <p className={styles.meta}>{food.category} • {food.region}</p>
          <p className={styles.excerpt}>{(food.description || '').slice(0, 60)}{(food.description||'').length>60? '…':''}</p>
        </div>
      </div>
      <div className={styles.cardRight}>
        <div>
          <img
            src={food.image || `https://picsum.photos/seed/food${food.id}/400/300`}
            alt={food.name}
            className={styles.thumb}
            width={120}
            height={80}
          />
        </div>
        <div className={styles.stats}>
          <span className={styles.cal}>{food.calories} kcal</span>
          <span className={styles.sat}>⭐ {food.satisfaction}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [combo, setCombo] = useState({ main_food_id: '', snack_food_id: '', soup_food_id: '', dessert_food_id: '', drink_food_id: '' });
  const [comboResult, setComboResult] = useState(null);

  useEffect(() => {
    async function fetchFoods() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/food/delicacies");
        const data = await res.json();
        setFoods(data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchFoods();
  }, []);

  const filtered = foods.filter(f => f.name.toLowerCase().includes(q.toLowerCase()) || (f.name_en || '').toLowerCase().includes(q.toLowerCase()));

  const categoriesMap = foods.reduce((acc, f) => {
    acc[f.category] = acc[f.category] || [];
    acc[f.category].push(f);
    return acc;
  }, {});

  async function submitCombo(e) {
    e.preventDefault();
    const body = {
      main_food_id: combo.main_food_id ? Number(combo.main_food_id) : null,
      snack_food_id: combo.snack_food_id ? Number(combo.snack_food_id) : null,
      soup_food_id: combo.soup_food_id ? Number(combo.soup_food_id) : null,
      dessert_food_id: combo.dessert_food_id ? Number(combo.dessert_food_id) : null,
      drink_food_id: combo.drink_food_id ? Number(combo.drink_food_id) : null,
    };
    try {
      const res = await fetch('http://localhost:8000/api/food/memory-combo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      setComboResult(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>台灣50大美食</h1>

        <div className={styles.searchBar}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="搜尋食物名稱或英文" />
        </div>

        <section className={styles.combo}>
          <h2>記憶口訣組合 (主食→小吃→湯品→甜點→飲料)</h2>
          <form onSubmit={submitCombo} className={styles.comboForm}>
            <select value={combo.main_food_id} onChange={e=>setCombo({...combo, main_food_id: e.target.value})}>
              <option value="">選擇主食</option>
              {(categoriesMap['主食']||[]).map(f=> <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <select value={combo.snack_food_id} onChange={e=>setCombo({...combo, snack_food_id: e.target.value})}>
              <option value="">選擇小吃</option>
              {(categoriesMap['小吃']||[]).map(f=> <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <select value={combo.soup_food_id} onChange={e=>setCombo({...combo, soup_food_id: e.target.value})}>
              <option value="">選擇湯品</option>
              {(categoriesMap['湯品']||[]).map(f=> <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <select value={combo.dessert_food_id} onChange={e=>setCombo({...combo, dessert_food_id: e.target.value})}>
              <option value="">選擇甜點</option>
              {(categoriesMap['甜點']||[]).map(f=> <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <select value={combo.drink_food_id} onChange={e=>setCombo({...combo, drink_food_id: e.target.value})}>
              <option value="">選擇飲料</option>
              {(categoriesMap['飲料']||[]).map(f=> <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <button className={styles.primary} type="submit">計算組合</button>
          </form>

          {comboResult && (
            <div className={styles.comboResult}>
              <h3>結果</h3>
              <p>總卡路里：{comboResult.total_calories}</p>
              <p>平均滿意度：{comboResult.avg_satisfaction}</p>
              <p>評語：{comboResult.comment}</p>
              <div>
                {comboResult.selected && comboResult.selected.map(s => (
                  <div key={s.food.id}>{s.step}: {s.food.name}</div>
                ))}
              </div>
            </div>
          )}
        </section>

        {loading ? (
          <p>載入中…</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map(food => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>後端 API: http://localhost:8000</p>
      </footer>
    </div>
  );
}
