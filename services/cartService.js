
const checkAndAddOffers = (cart) => {

    try {

        in_cart = cart;
        offer_array = []

        //check For BOGO

        for (let i = 0; i < in_cart.length; i++) {
            console.log("Inside I loop ", i)
            if (in_cart[i].product_code === 'CF1') {

                offer_array.push({ ...in_cart[i], offer_code: "BOGO", price: 0, quantity: in_cart[i].quantity })
            }
        }







        //check for CHMK
        for (let i = 0; i < in_cart.length; i++) {
            console.log("Inside I loop ", i)
            if (in_cart[i].product_code === 'CH1') {
                if (in_cart[i].quantity >= 1) {

                    offer_array.push({ product_code: "MK1", name: "Milk", offer_code: "CHMK", price: 0.00, quantity: 1 })
                }

            }
        }



        //check for APOM
        for (let i = 0; i < in_cart.length; i++) {
            console.log("Inside I loop ", i)
            if (in_cart[i].product_code === 'OM1') {
                for (let j = 0; j < in_cart.length; j++) {
                    if (in_cart[j].product_code === 'AP1') {

                        let apples_quantity = in_cart[j].quantity
                        if (in_cart[i].quantity >= apples_quantity) {
                            offer_array.push({ product_code: "AP1", name: "Apples", offer_code: "APOM", price: -3.00, quantity:  apples_quantity })

                        }
                        else {
                            offer_array.push({ product_code: "AP1", name: "Apples", offer_code: "APOM", price: -3.00, quantity: in_cart[i].quantity })
                        }


                    }



                }
            }
        }


            //check for APPL

            for (let i = 0; i < in_cart.length; i++) {
                console.log("Inside I loop ", i)
                if (in_cart[i].product_code === 'AP1') {
                    if (in_cart[i].quantity >= 3) {

                        let om1_exists = false

                        for (let j = 0; j < in_cart.length; j++) {
                            console.log("Inside I loop ", j)
                            if (in_cart[j].product_code === 'OM1') {

                                om1_exists = true;
                                let oatmeal_quantity = in_cart[j].quantity
                                if (in_cart[i].quantity > oatmeal_quantity) {

                                    offer_array.push({ ...in_cart[i], offer_code: "APPL", price: -1.50, quantity: in_cart[i].quantity - oatmeal_quantity })
                                }
                            }
    

                        }
                        console.log("OM exists",om1_exists)
                        if(!om1_exists){
                            console.
                            offer_array.push({ ...in_cart[i], offer_code: "APPL", price: -1.50, quantity: in_cart[i].quantity })

                        }
                    }
                }
            }

            
            return offer_array


        }
      catch (err) {
            console.error('Error: ', err)
            reject(err);
        }
    }
        module.exports.checkAndAddOffers = checkAndAddOffers;