import { connectDB } from "@/lib/db/connect";
import { Messages } from "@/lib/models/Messages";
import { ConversationHistory } from "@/lib/models/ConversationHistory";
import { MENTORS } from "@/lib/mentors/config";
import { ROLES } from "@/lib/constant";
import { DashboardStats, MentorStats, PeriodBucket, ScoreBandCounts } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
}

function getScoreBand(score: number): keyof ScoreBandCounts {
    if (score >= 75) return "green";
    if (score >= 50) return "yellow";
    return "red";
}

function buildWeeklyBuckets(now: Date) {
    const buckets = [];
    for (let i = 6; i >= 0; i--) {
        const start = startOfDay(new Date(now.getTime() - i * DAY_MS));
        const end = new Date(start.getTime() + DAY_MS);
        buckets.push({ start, end, label: start.toLocaleDateString(undefined, { weekday: "short" }) });
    }
    return buckets;
}

function buildMonthlyBuckets(now: Date) {
    const buckets = [];
    for (let i = 4; i >= 0; i--) {
        const end = startOfDay(new Date(now.getTime() - i * 7 * DAY_MS + DAY_MS));
        const start = new Date(end.getTime() - 7 * DAY_MS);
        buckets.push({
            start,
            end,
            label: `Week of ${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
        });
    }
    return buckets;
}

function summarizeBucket(
    bucket: { start: Date; end: Date; label: string },
    messages: { role: string; score?: number; suggestion?: string; createdAt: Date }[]
): PeriodBucket {
    const inBucket = messages.filter((m) => m.createdAt >= bucket.start && m.createdAt < bucket.end);

    const userMessages = inBucket.filter((m) => m.role === ROLES.USER);
    const scored = userMessages.filter((m) => typeof m.score === "number");
    const scoreBands: ScoreBandCounts = { red: 0, yellow: 0, green: 0 };
    scored.forEach((m) => scoreBands[getScoreBand(m.score as number)]++);

    const avgScore = scored.length
        ? Math.round(scored.reduce((sum, m) => sum + (m.score as number), 0) / scored.length)
        : null;

    const suggestionsUsed = inBucket.filter((m) => m.role === ROLES.ASSISTANT && m.suggestion).length;

    return {
        label: bucket.label,
        scoreBands,
        avgScore,
        totalMessages: userMessages.length,
        suggestionsUsed,
    };
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
    await connectDB();

    const now = new Date();
    const rangeStart = new Date(now.getTime() - 35 * DAY_MS); // covers monthly (5 weeks) + buffer

    const conversations = await ConversationHistory.find({ userId }).select("_id mentorName").lean();
    const conversationIds = conversations.map((c) => c._id);
    const mentorNameByConversation = new Map(
        conversations.map((c) => [c._id.toString(), c.mentorName])
    );

    const messages = await Messages.find({
        conversationId: { $in: conversationIds },
        createdAt: { $gte: rangeStart },
    })
        .select("role score suggestion mentorName conversationId createdAt")
        .lean();

    const weeklyBuckets = buildWeeklyBuckets(now);
    const monthlyBuckets = buildMonthlyBuckets(now);

    const mentors: MentorStats[] = MENTORS.map((mentor) => {
        const mentorMessages = messages.filter((m) => {
            const resolvedMentorName = m.mentorName ?? mentorNameByConversation.get(m.conversationId.toString());
            return resolvedMentorName === mentor.name;
        });

        return {
            mentorName: mentor.name,
            mentorTitle: mentor.title,
            weekly: weeklyBuckets.map((b) => summarizeBucket(b, mentorMessages)),
            monthly: monthlyBuckets.map((b) => summarizeBucket(b, mentorMessages)),
        };
    });

    return { mentors };
}