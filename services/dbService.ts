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

    // get all invoices ids
    const invoiceIds = allInvoices.map(invoice => invoice._raw.id);

    const allPayments = await paymentsCollection.query(
        Q.where('invoice', Q.oneOf(invoiceIds))
    ).fetch();

    // map all payments to invoices
    const updatedInvoices = allInvoices.map((invoice) => {
        const payments = allPayments.filter(payment => payment._raw.invoice === invoice._raw.id);
        return {
            ...invoice,
            payments: payments
        }
    })

    // remove the amount of payments from each invoice
    const allInvoicesWithPayments = updatedInvoices.map((invoice) => {
        const payments = invoice.payments || [];
        const amountPaid = payments.reduce((acc, payment) => {
            return acc + (payment._raw.amount || 0);
        }, 0);
        const amountDue = invoice._raw.amount_due || 0;
        const amountLeft = amountDue - amountPaid;
        return {
            ...invoice,
            amountPaid: amountPaid,
            amountLeft: amountLeft
        }
    })

    // Calculate statistics
    const stats = {
        totalInvoices: allInvoicesWithPayments.length,
        totalPayments: allPayments.length,
        totalAmountDue: allInvoicesWithPayments.reduce((acc, invoice) => {
            return acc + (invoice._raw.amount_due || 0);
        }, 0),
        totalAmountPaid: allInvoicesWithPayments.reduce((acc, invoice) => {
            return acc + (invoice.amountPaid || 0);
        }, 0),
        totalAmountLeft: allInvoicesWithPayments.reduce((acc, invoice) => {
            return acc + (invoice.amountLeft || 0);
        }, 0)
    }
    console.log('stats', stats)

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