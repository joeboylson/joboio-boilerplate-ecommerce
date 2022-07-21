export const checkIfItemsAreInStock = async (items) => {
  try {
    const productIdsArray = items.map(_item => _item.id);
    const productIds = productIdsArray.join(",")
    const producIdSearchParams = new URLSearchParams({ productIds })
    const url = `/products-by-id?${producIdSearchParams}`;
  
    const fetchResult = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
  
    const { products } = await fetchResult.json()

    console.log(products)

    const productIdToQuantityMap = items.reduce((_map, item) => {
      if (!_map[item.id]) return { ..._map, [item.id]: item.quantity }
      const _quantity = _map[item.id] + item.quantity
      return {..._map, [item.id]: _quantity }
    }, {});

    console.log(productIdToQuantityMap)

    const productsInStockStatus = products.map(product => {
      if (product.ignoreStock) return true;
      const quantityInCart = productIdToQuantityMap[product.id];
      return quantityInCart <= product.stock
    });

    console.log(productsInStockStatus)

    return productsInStockStatus.every(Boolean);
  } catch (e) {
    console.log(e)
    return false;
  }
}