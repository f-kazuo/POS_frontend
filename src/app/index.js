import { useState } from "react";
import axios from "axios";

export default function POSApp() {
  const [code, setCode] = useState("");
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // 商品情報を取得する関数
  const fetchProduct = async () => {
    try {
      const response = await axios.get(`https://tech0-gen8-step4-pos-app-88.azurewebsites.net/api/product/${code}`);
      console.log(response.data);  // デバッグ用のログ
      setProduct(response.data);
    } catch (error) {
      alert("商品が見つかりません。");
      setProduct(null);
    }
  };

  // カートに商品を追加する関数
  const addToCart = () => {
    if (!product) return;

    const updatedCart = [...cart];
    const existingItem = updatedCart.find((item) => item.code === product.code);

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.totalPrice += product.price;
    } else {
      updatedCart.push({
        ...product,
        quantity: 1,
        totalPrice: product.price,
      });
    }

    setCart(updatedCart);
    setTotal(updatedCart.reduce((sum, item) => sum + item.totalPrice, 0));
    setProduct(null);
    setCode("");
  };

  // 購入処理を行う関数
  const handlePurchase = async () => {
    try {
      const items = cart.map((item) => ({
        product_code: item.code,
        quantity: item.quantity,
      }));

      const response = await axios.post("https://tech0-gen8-step4-pos-app-88.azurewebsites.net/api/purchase/", {
        cashier_id: "9999999999",
        items,
      });

      alert(`購入完了！ 合計金額: ¥${response.data.total_amount}`);
      setCart([]);
      setTotal(0);
    } catch (error) {
      alert("購入に失敗しました。");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>POSシステム</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="商品コードを入力"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button onClick={fetchProduct}>検索</button>
      </div>

      {product && (
        <div style={{ marginBottom: "20px" }}>
          <p>商品名: {product.name}</p>
          <p>価格: ¥{product.price}</p>
          <button onClick={addToCart}>カートに追加</button>
        </div>
      )}

      <h2>カート</h2>
      <ul>
        {cart.map((item) => (
          <li key={item.code}>{item.name} x{item.quantity} - ¥{item.totalPrice}</li>
        ))}
      </ul>

      <p>合計金額: ¥{total}</p>
      <button onClick={handlePurchase} disabled={!cart.length}>購入</button>
    </div>
  );
}
