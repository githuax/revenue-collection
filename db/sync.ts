import { SyncDatabaseChangeSet, synchronize } from '@nozbe/watermelondb/sync'
import database from '.'
import { supabase } from '~/utils/supabase'

const syncDb = async () => {
    await synchronize({
        database,
        pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {

            const { data, error } = await supabase.rpc('pull_data', {
                last_pulled_at: lastPulledAt,
            })

            if (error) {
                console.error('Error pulling changes:', error)
                throw new Error('Error pulling changes from Supabase')
            }

            const { changes, timestamp } = data as {
                changes: SyncDatabaseChangeSet
                timestamp: number
            }

            return { changes, timestamp }
        },
        pushChanges: async ({ changes, lastPulledAt }) => {
            const { error } = await supabase.rpc('push_data', { changes })
            if (error) {
                console.error('Error pushing changes:', error)
            } else {
                console.log('Changes pushed successfully')
            }
        },
        sendCreatedAsUpdated: true,
    }).catch((error) => {
        console.error('Error syncing database:', error)
    })
}

export default syncDb;
