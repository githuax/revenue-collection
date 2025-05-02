import { Q } from "@nozbe/watermelondb";
import database, {
    invoicesCollection,
    payersCollection,
    paymentsCollection
} from "~/db"

import useAuthStore from "~/store/authStore";
import { INVOICE_STATUS } from "./constants";

const getPayerByTIN = async (tin) => {
    const data = await payersCollection.query(
        Q.where('tin', tin),
    ).fetch();
    return data[0];
}

const getAllPayers = async () => {
    const data = await payersCollection.query().fetch();
    return data;
}

const getMyPayers = async () => {
    const data = await payersCollection.query(
        Q.where('created_by', useAuthStore.getState().userData?.id || '')
    ).fetch();

    return data;
}

const getMyPayments = async () => {
    const data = await paymentsCollection.query(
        Q.where('created_by', useAuthStore.getState().userData?.id || '')
    ).fetch();

    return data;
}

const getMyInvoices = async () => {

}

const getPayerInvoices = async (payerID) => {
    console.log('payer id',payerID)
    const data = invoicesCollection.query(
        Q.where('payer_id', payerID)
    ).fetch();

    return data;
}

const getAllInvoices = async () => {
    const data = invoicesCollection.query().fetch();

    return data;
}

const getPayerPayments = async () => {

}

const getPayerProperties = async () => {

}

const getFeedPayments = async () => {
    const userId = useAuthStore.getState().userData?.id || '';

    const data = await invoicesCollection.query(
        Q.and(
            Q.where('created_by', userId),
            Q.where('status', Q.notEq(INVOICE_STATUS.PAID))
        )
    ).fetch();

    const payers = await getAllPayers();

    const updatedPayers = payers.reduce((acc, payer) => {
        return {...acc, [payer.id]: payer}
    }, {})

    const updatedData = data.map((invoice) => {
        const payer = updatedPayers[invoice._raw.payer_id]
        return {
            ...invoice,
            payerData: payer
        }
    })

    return updatedData;
};


const getDashboardStats = async () => {
    const userId = useAuthStore.getState().userData?.id || '';
    console.log(userId)
    
    // Get all invoices for the current user
    const allInvoices = await invoicesCollection.query(
        Q.and(
            Q.where('created_by', userId),
            Q.where('status', Q.notEq(INVOICE_STATUS.PAID))
        )
    ).fetch();

    // Calculate statistics
    const stats = allInvoices.reduce((acc, invoice) => {
        console.log('invoice', invoice)

        const amount = invoice._raw.amount_due || 0;
        
        if (invoice._raw.status === INVOICE_STATUS.PAID) {
            acc.completedPayments += amount;
        } else {
            acc.pendingPayments += 1;
            acc.amountToCollect += amount;
        }
        
        return acc;
    }, {
        pendingPayments: 0,
        amountToCollect: 0,
        completedPayments: 0
    });

    return stats;
};

export {
    getPayerByTIN,
    getAllPayers,
    getMyPayers,
    getMyPayments,
    getMyInvoices,
    getPayerInvoices,
    getPayerPayments,
    getPayerProperties,
    getFeedPayments,
    getAllInvoices,
    getDashboardStats
}