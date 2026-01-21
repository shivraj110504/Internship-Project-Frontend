// pages/questions/index.tsx

import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import QuestionCard from "@/components/QuestionCard";
import { toast } from "react-toastify";

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const res = await axiosInstance.get("/question/getallquestion");
                
                console.log("📦 Raw API response:", res.data);
                
                // Handle different response formats
                let questionData: any[] = [];
                
                if (Array.isArray(res.data)) {
                    // Backend returns array directly
                    questionData = res.data;
                } else if (res.data.data && Array.isArray(res.data.data)) {
                    // Backend returns { data: [...] }
                    questionData = res.data.data;
                } else if (res.data.success && Array.isArray(res.data.data)) {
                    // Backend returns { success: true, data: [...] }
                    questionData = res.data.data;
                } else {
                    console.error("❌ Unexpected response format:", res.data);
                    throw new Error("Invalid response format from server");
                }
                
                console.log(`✅ Fetched ${questionData.length} questions`);
                
                // Sort by date descending (newest first)
                const sorted = questionData.sort((a: any, b: any) => {
                    const dateA = new Date(a.askedon).getTime();
                    const dateB = new Date(b.askedon).getTime();
                    return dateB - dateA;
                });
                
                setQuestions(sorted);
            } catch (error: any) {
                console.error("❌ Error fetching questions:", error);
                const errorMessage = error.response?.data?.message || error.message || "Failed to load questions";
                setError(errorMessage);
                toast.error(errorMessage);
                setQuestions([]); // Set empty array on error
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

    if (error) {
        return (
            <Mainlayout>
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-red-500 text-lg font-semibold mb-4">
                        {error}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                    >
                        Retry
                    </button>
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
                            <p className="text-lg mb-2">No questions found.</p>
                            <button
                                onClick={() => router.push("/ask")}
                                className="text-blue-600 hover:underline"
                            >
                                Be the first to ask a question!
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </Mainlayout>
    );
}