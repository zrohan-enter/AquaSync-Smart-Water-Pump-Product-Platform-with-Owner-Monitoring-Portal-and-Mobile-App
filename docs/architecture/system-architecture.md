# System Architecture
1. **Flow:** Simulated Purchase -> UUID Generation -> User Activation -> Owner Portal.
2. **Real-time:** Simulator pushes data to PostgreSQL; Dashboard listens via Supabase Realtime/Socket.io.
3. **Data Integrity:** Digital Twin model ensures only owners see their specific pump data.
