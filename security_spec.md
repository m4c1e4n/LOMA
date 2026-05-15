# Security Specification - Ghana Youth Opportunity Map

## Data Invariants
1. A user can only access their own profile.
2. A user can only access their own applications.
3. Opportunities and Learning Resources are public for reading.
4. Applications must reference a valid user and a valid opportunity.
5. Users can update the status of their own applications (as requested).

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Attempt to create an application with a different `userId`.
2. **Access Violation**: User A attempts to read User B's profile.
3. **Write Violation**: User A attempts to update User B's application status.
4. **Invalid ID**: Attempt to create a document with a junk ID.
5. **Schema Violation**: Attempt to create an opportunity with missing required fields.
6. **Immutable Field Attack**: Attempt to change the `appliedAt` field in an application.
7. **Type Poisoning**: Sending a string for a latitude number.
8. **Resource Exhaustion**: Sending a 1MB string for a company name.
9. **Status Validation**: Attempt to set application status to 'invalid_status'.
10. **State Shortcut**: (Not applicable here as any transition is allowed by user).
11. **Admin Escalation**: Attempt to modify a role field (if it existed).
12. **orphaned Record**: Create an application for a non-existent opportunity.

## Test Strategy
We will use `firestore.rules` to enforce these constraints.

/src/__tests__/firestore.rules.test.ts (to be created if environment supports it, but I will focus on the rules themselves for now).
