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

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>台灣50大美食</h1>

        <div className={styles.searchBar}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="搜尋食物名稱或英文" />
        </div>

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
