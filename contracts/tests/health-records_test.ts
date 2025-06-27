import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can create a health record",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('health-records', 'create-record', [
                types.ascii("Annual Checkup"),
                types.ascii("general"),
                types.ascii("gaia://hub.gaia.blockstack.org/1234...")
            ], deployer.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), types.uint(1));
        
        // Verify record exists
        let getRecord = chain.callReadOnlyFn(
            'health-records',
            'get-record',
            [types.uint(1)],
            deployer.address
        );
        
        const record = getRecord.result.expectSome().expectTuple();
        assertEquals(record['title'], types.ascii("Annual Checkup"));
        assertEquals(record['record-type'], types.ascii("general"));
        assertEquals(record['owner'], deployer.address);
    }
});

Clarinet.test({
    name: "Can grant and check access permissions",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        // Create a record
        let block = chain.mineBlock([
            Tx.contractCall('health-records', 'create-record', [
                types.ascii("Blood Test"),
                types.ascii("lab-results"),
                types.ascii("gaia://hub.gaia.blockstack.org/5678...")
            ], deployer.address)
        ]);
        
        // Grant read access to user1
        block = chain.mineBlock([
            Tx.contractCall('health-records', 'grant-access', [
                types.uint(1),
                user1.address,
                types.bool(true),
                types.bool(false)
            ], deployer.address)
        ]);
        
        assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
        
        // Check if user1 can access the record
        let canAccess = chain.callReadOnlyFn(
            'health-records',
            'can-access-record',
            [types.uint(1), user1.address],
            user1.address
        );
        
        assertEquals(canAccess.result, types.bool(true));
    }
});

Clarinet.test({
    name: "Cannot grant access to non-existent record",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('health-records', 'grant-access', [
                types.uint(999),
                user1.address,
                types.bool(true),
                types.bool(false)
            ], deployer.address)
        ]);
        
        assertEquals(block.receipts[0].result.expectErr(), types.uint(102));
    }
});

Clarinet.test({
    name: "Only record owner can grant access",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;
        
        // Create a record as deployer
        let block = chain.mineBlock([
            Tx.contractCall('health-records', 'create-record', [
                types.ascii("X-Ray Results"),
                types.ascii("imaging"),
                types.ascii("gaia://hub.gaia.blockstack.org/9999...")
            ], deployer.address)
        ]);
        
        // Try to grant access as user1 (not owner)
        block = chain.mineBlock([
            Tx.contractCall('health-records', 'grant-access', [
                types.uint(1),
                user2.address,
                types.bool(true),
                types.bool(false)
            ], user1.address)
        ]);
        
        assertEquals(block.receipts[0].result.expectErr(), types.uint(101));
    }
});
