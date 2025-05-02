import { Q } from "@nozbe/watermelondb";
import database, {
    payersCollection
} from "~/db"

const getPayerByTIN = async (tin) => {
    const data = await payersCollection.query(
        Q.where('tin', tin),
    ).fetch();
    return data[0];
}

export {
    getPayerByTIN
}