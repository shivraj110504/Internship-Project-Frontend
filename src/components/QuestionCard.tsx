import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface QuestionCardProps {
    question: any;
    alternating?: boolean;
}

const QuestionCard = ({ question, alternating = false }: QuestionCardProps) => {
    return (
        <div className={`p-4 border-b border-gray-200 ${alternating ? "bg-[#FEF9E7]" : "bg-white"}`}>
            <div className="flex gap-4">
                {/* Left Stats Section */}
                <div className="flex flex-col items-end w-24 gap-2 text-[#6A737C] text-sm flex-shrink-0">
                    <div className="flex items-center gap-1">
                        <span className="font-medium text-[#232629]">{question.upvote?.length || 0}</span>
                        <span>votes</span>
                    </div>
                    <div className={`flex items-center gap-1 border border-transparent rounded px-1 ${question.noofanswer > 0 ? "border-[#2D6A4F] text-[#2D6A4F]" : ""}`}>
                        <span className="font-medium">{question.noofanswer || 0}</span>
                        <span>answers</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#6A737C]">
                        <span className="font-medium">{(question.views || 0)}</span>
                        <span>views</span>
                    </div>
                </div>

                {/* Right Content Section */}
                <div className="flex-1 min-w-0">
                    <Link
                        href={`/questions/${question._id}`}
                        className="text-[#0074CC] hover:text-[#0A95FF] text-lg lg:text-xl font-medium mb-1 block leading-tight"
                    >
                        {question.questiontitle}
                    </Link>
                    <p className="text-[#3B4045] text-sm mb-2 line-clamp-2 leading-relaxed">
                        {question.questionbody}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-y-3">
                        <div className="flex flex-wrap gap-1">
                            {question.questiontags?.map((tag: string) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-[#E1ECF4] text-[#39739D] hover:bg-[#D1E2EE] border-none text-[10px] px-1.5 py-0.5 font-normal rounded cursor-pointer"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs ml-auto">
                            <Avatar className="w-4 h-4 rounded-sm">
                                <AvatarFallback className="bg-orange-500 text-white text-[10px] uppercase">
                                    {question.userposted?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-1">
                                <Link href={`/users/${question.userid}`} className="text-[#0074CC] hover:text-[#0A95FF]">
                                    {question.userposted}
                                </Link>
                                <span className="font-bold text-[#3B4045]">{question.authorRep || 1}</span>
                                <span className="text-[#6A737C]">
                                    asked {new Date(question.askedon).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;
