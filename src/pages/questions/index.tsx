import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import QuestionCard from "@/components/QuestionCard";

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axiosInstance.get("/question/getallquestion");
                // Sort by date descending (newest first)
                const sorted = res.data.data.sort((a: any, b: any) =>
                    new Date(b.askedon).getTime() - new Date(a.askedon).getTime()
                );
                setQuestions(sorted);
            } catch (error) {
                console.error("Error fetching questions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    if (loading) {
        return (
            <Mainlayout>
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                </div>
            </Mainlayout>
        );
    }

    return (
        <Mainlayout>
            <main className="min-w-0 p-4 lg:p-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-2xl lg:text-3xl font-medium text-[#232629]">
                        Newest Questions
                    </h1>
                    <button
                        onClick={() => router.push("/ask")}
                        className="bg-[#0A95FF] hover:bg-[#0074CC] text-white px-4 py-2 rounded text-sm font-medium shadow-sm transition-colors whitespace-nowrap"
                    >
                        Ask Question
                    </button>
                </div>

                {/* Filter and Count Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 text-sm gap-4">
                    <span className="text-[#232629] text-base lg:text-lg">
                        {questions.length.toLocaleString()} questions
                    </span>

                    <div className="flex flex-wrap items-center border border-[#9FA6AD] rounded overflow-hidden">
                        <button className="px-3 py-2 bg-[#E3E6E8] text-[#232629] border-r border-[#9FA6AD] hover:bg-[#D6D9DC] text-xs font-medium">
                            Newest
                        </button>
                        <button className="px-3 py-2 text-[#6A737C] border-r border-[#9FA6AD] hover:bg-[#F8F9F9] text-xs">
                            Active
                        </button>
                        <button className="px-3 py-2 text-[#6A737C] border-r border-[#9FA6AD] hover:bg-[#F8F9F9] text-xs flex items-center">
                            Bountied
                            <Badge variant="secondary" className="ml-1 bg-[#0074CC] text-white hover:bg-[#0074CC] px-1 h-4 text-[10px]">
                                14
                            </Badge>
                        </button>
                        <button className="px-3 py-2 text-[#6A737C] border-r border-[#9FA6AD] hover:bg-[#F8F9F9] text-xs">
                            Unanswered
                        </button>
                        <button className="px-3 py-2 text-[#6A737C] border-r border-[#9FA6AD] hover:bg-[#F8F9F9] text-xs">
                            More ▼
                        </button>
                        <button className="px-3 py-2 text-[#0074CC] hover:bg-[#F0F8FF] text-xs flex items-center">
                            Filter
                        </button>
                    </div>
                </div>

                {/* Question List */}
                <div className="space-y-0 border-t border-gray-200 -mx-4 lg:-mx-6">
                    {questions.length > 0 ? (
                        questions.map((q: any, index: number) => (
                            <QuestionCard
                                key={q._id}
                                question={q}
                                alternating={index % 2 !== 0}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            No questions found.
                        </div>
                    )}
                </div>
            </main>
        </Mainlayout>
    );
}
