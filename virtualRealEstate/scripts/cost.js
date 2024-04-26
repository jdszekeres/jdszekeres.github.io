function update_cost(_3d) {
    time = 0;
    cost = 0; //in USD

    // Calculate Cost
    _3d.blocks.forEach((block)=>{
        data = block.userData.data;
        if (data.hasOwnProperty("cost")) {
            cost += data.price_per_cubic_meter;
            
        }
    })
}