import { totalmem } from "os";
import { ProgramDashboard } from ".";

type CommitteeMember = {
    name: string;
};

type CommitteeData = {
    [role: string]: CommitteeMember[];
};

export default function ProgramCommittee() {
    const committeeData: CommitteeData = {
        "Event Chair": [{ name: "Alice Johnson" }],
        "Logistics Coordinator": [
            { name: "Bob Williams" },
            { name: "Sophie Turner" },
        ],
        "Marketing Lead": [{ name: "Clara Davis" }],
        "Finance Manager": [{ name: "David Lee" }],
        "Speaker Coordinator": [{ name: "Emma Thompson" }],
        "Technical Support": [
            { name: "Frank Miller" },
            { name: "Isabella Clark" },
        ],
        "Volunteer Coordinator": [{ name: "Grace Brown" }],
        "Catering Manager": [{ name: "Henry White" }],
    };

    const totalMembers = Object.values(committeeData).reduce(
        (acc, members) => acc + members.length,
        0
    );

    return (
        <div>
            <header>
                <h2>Commitee - {totalMembers}</h2>
            </header>
            <main>
                {Object.keys(committeeData).map((role) => (
                    <div key={role}>
                        <h3>{role}</h3>
                        <ul>
                            {committeeData[role].map((member, index) => (
                                <li key={index}>{member.name}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </main>
        </div>
    );
}
