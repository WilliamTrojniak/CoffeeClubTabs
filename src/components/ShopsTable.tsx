import { Shop } from "@/db/schema/shops";

const ShopsTable = async ({shops}: {shops: Shop[]}) => {

  const entries = shops.map(shop => <p key={shop.id}>{shop.name}</p>)

  return <>{entries}</>;

}

export default ShopsTable;
