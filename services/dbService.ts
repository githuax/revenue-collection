import { Q } from "@nozbe/watermelondb";
import database, {
    invoicesCollection,
    payersCollection,
    paymentsCollection,
    propertiesCollection
} from "~/db"

import useAuthStore from "~/store/authStore";
import { INVOICE_STATUS } from "./constants";

const getPayerByTIN = async (tin) => {
    const data = await payersCollection.query(
        Q.where('tin', tin),
    ).fetch();

    const properties = await propertiesCollection.query(
        Q.where('owner_id', data[0]._raw.id)
    ).fetch();
    const invoices = await invoicesCollection.query(
        Q.where('payer_id', data[0]._raw.id)
    ).fetch();
    const payments = await paymentsCollection.query(
        Q.where('payer_id', data[0]._raw.id)
    ).fetch();

    return {
        data: data[0],
        properties: properties,
        invoices: invoices,
        payments: payments
    };
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

const getMyInvoices = async () => {

}

const getPayerInvoices = async (payerID) => {
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

    return stats;
};

const getMyPayments = async () => {
    const data = await paymentsCollection.query(
        Q.where('created_by', useAuthStore.getState().userData?.id || '')
    ).fetch();

    return data;
}

const getAllPayments = async () => {
    const data = await paymentsCollection.query().fetch();
    return data;
}

const getPaymentInfoWithPayerName = async () => {
    const payments = await getAllPayments();
    const payers = await getAllPayers();

    const updatedPayments = payments.map((payment) => {
        const payer = payers.find((payer) => payer.id === payment._raw.payer_id);
        return {
            ...payment,
            payerName: payer ? payer.firstName + ' ' + payer.lastName : ''
        }
    })

    return updatedPayments;
}

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
    getDashboardStats,
    getPaymentInfoWithPayerName,
    getAllPayments
}