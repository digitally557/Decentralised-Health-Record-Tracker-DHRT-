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

// Emergency Access Tests
Clarinet.test({
    name: "Can add emergency contact",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const emergencyContact = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('health-records', 'add-emergency-contact', [
                emergencyContact.address,
                types.ascii("family"),
                types.ascii("Spouse"),
                types.bool(true)
            ], deployer.address)
        ]);
        
        assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
        
        // Verify emergency contact exists
        let getContact = chain.callReadOnlyFn(
            'health-records',
            'get-emergency-contact',
            [deployer.address, emergencyContact.address],
            deployer.address
        );
        
        const contact = getContact.result.expectSome().expectTuple();
        assertEquals(contact['contact-type'], types.ascii("family"));
        assertEquals(contact['relationship'], types.ascii("Spouse"));
        assertEquals(contact['can-access-all'], types.bool(true));
        assertEquals(contact['is-active'], types.bool(true));
    }
});

Clarinet.test({
    name: "Cannot add duplicate emergency contact",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const emergencyContact = accounts.get('wallet_1')!;
        
        // Add emergency contact first time
        let block = chain.mineBlock([
            Tx.contractCall('health-records', 'add-emergency-contact', [
                emergencyContact.address,
                types.ascii("family"),
                types.ascii("Spouse"),
                types.bool(true)
            ], deployer.address)
        ]);
        assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
        
        // Try to add same contact again
        block = chain.mineBlock([
            Tx.contractCall('health-records', 'add-emergency-contact', [
                emergencyContact.address,
                types.ascii("doctor"),
                types.ascii("Primary Care"),
                types.bool(false)
            ], deployer.address)
        ]);
        
        assertEquals(block.receipts[0].result.expectErr(), types.uint(103));
    }
});

Clarinet.test({
    name: "Can remove emergency contact",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const emergencyContact = accounts.get('wallet_1')!;
        
        // Add emergency contact
        let block = chain.mineBlock([
            Tx.contractCall('health-records', 'add-emergency-contact', [
                emergencyContact.address,
                types.ascii("family"),
                types.ascii("Spouse"),
                types.bool(true)
            ], deployer.address)
        ]);
        assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
        
        // Remove emergency contact
        block = chain.mineBlock([
            Tx.contractCall('health-records', 'remove-emergency-contact', [
                emergencyContact.address
            ], deployer.address)
        ]);
        assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
        
        // Verify contact is deactivated
        let isEmergencyContact = chain.callReadOnlyFn(
            'health-records',
            'is-emergency-contact',
            [deployer.address, emergencyContact.address],
            deployer.address
        );
        assertEquals(isEmergencyContact.result, types.bool(false));
    }
});

Clarinet.test({
    name: "Emergency contact can access records",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const emergencyContact = accounts.get('wallet_1')!;
        
        // Create a health record
        let block = chain.mineBlock([
            Tx.contractCall('health-records', 'create-record', [
                types.ascii("Emergency Medical Info"),
                types.ascii("general"),
                types.ascii("gaia://hub.gaia.blockstack.org/emergency...")
            ], deployer.address)
        ]);
        assertEquals(block.receipts[0].result.expectOk(), types.uint(1));
        
        // Add emergency contact
        block = chain.mineBlock([
            Tx.contractCall('health-records', 'add-emergency-contact', [
                emergencyContact.address,
                types.ascii("family"),
                types.ascii("Spouse"),
                types.bool(true)
            ], deployer.address)
        ]);
        assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
        
        // Emergency contact accesses record
        block = chain.mineBlock([
            Tx.contractCall('health-records', 'emergency-access-record', [
                types.uint(1),
                types.ascii("Medical emergency - patient unconscious, need medical history")
            ], emergencyContact.address)
        ]);
        
        // Should return the gaia URL
        assertEquals(block.receipts[0].result.expectOk(), types.ascii("gaia://hub.gaia.blockstack.org/emergency..."));
        
        // Verify access is logged
        let accessLog = chain.callReadOnlyFn(
            'health-records',
            'get-emergency-access-log',
            [types.uint(1), emergencyContact.address, types.uint(1)],
            emergencyContact.address
        );
        
        const log = accessLog.result.expectSome().expectTuple();
        assertEquals(log['record-owner'], deployer.address);
        assertEquals(log['access-reason'], types.ascii("Medical emergency - patient unconscious, need medical history"));
        assertEquals(log['is-valid'], types.bool(true));
    }
});

Clarinet.test({
    name: "Non-emergency contact cannot access records",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        // Create a health record
        let block = chain.mineBlock([
            Tx.contractCall('health-records', 'create-record', [
                types.ascii("Private Medical Info"),
                types.ascii("general"),
                types.ascii("gaia://hub.gaia.blockstack.org/private...")
            ], deployer.address)
        ]);
        assertEquals(block.receipts[0].result.expectOk(), types.uint(1));
        
        // Try emergency access without being emergency contact
        block = chain.mineBlock([
            Tx.contractCall('health-records', 'emergency-access-record', [
                types.uint(1),
                types.ascii("Unauthorized access attempt")
            ], user1.address)
        ]);
        
        assertEquals(block.receipts[0].result.expectErr(), types.uint(101));
    }
});

Clarinet.test({
    name: "Contract owner can toggle emergency access system",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        // Toggle emergency access system (should disable it)
        let block = chain.mineBlock([
            Tx.contractCall('health-records', 'toggle-emergency-access-system', [], deployer.address)
        ]);
        assertEquals(block.receipts[0].result.expectOk(), types.bool(false));
        
        // Try to use emergency access when system is disabled
        // First create record and add emergency contact
        block = chain.mineBlock([
            Tx.contractCall('health-records', 'create-record', [
                types.ascii("Test Record"),
                types.ascii("general"),
                types.ascii("gaia://hub.gaia.blockstack.org/test...")
            ], deployer.address),
            Tx.contractCall('health-records', 'add-emergency-contact', [
                user1.address,
                types.ascii("family"),
                types.ascii("Child"),
                types.bool(true)
            ], deployer.address)
        ]);
        
        // Try emergency access (should fail because system is disabled)
        block = chain.mineBlock([
            Tx.contractCall('health-records', 'emergency-access-record', [
                types.uint(1),
                types.ascii("Emergency access when system disabled")
            ], user1.address)
        ]);
        assertEquals(block.receipts[0].result.expectErr(), types.uint(101));
        
        // Re-enable emergency access system
        block = chain.mineBlock([
            Tx.contractCall('health-records', 'toggle-emergency-access-system', [], deployer.address)
        ]);
        assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
        
        // Now emergency access should work
        block = chain.mineBlock([
            Tx.contractCall('health-records', 'emergency-access-record', [
                types.uint(1),
                types.ascii("Emergency access after re-enabling system")
            ], user1.address)
        ]);
        assertEquals(block.receipts[0].result.expectOk(), types.ascii("gaia://hub.gaia.blockstack.org/test..."));
    }
});

Clarinet.test({
    name: "Only contract owner can toggle emergency system",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        // Try to toggle emergency access system as non-owner
        let block = chain.mineBlock([
            Tx.contractCall('health-records', 'toggle-emergency-access-system', [], user1.address)
        ]);
        
        assertEquals(block.receipts[0].result.expectErr(), types.uint(100));
    }
});
