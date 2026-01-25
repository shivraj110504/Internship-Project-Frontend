// components/QuestionDetail.tsx

import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  History,
  Share,
  Trash,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "react-i18next";

// Utility function to sanitize and format text content
const formatContent = (content: string) => {
  if (!content) return "";

  // Escape HTML to prevent XSS and form rendering
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Process markdown-like formatting
  let formatted = content;

  // Extract and store code blocks to prevent double processing
  const codeBlocks: { [key: string]: string } = {};
  let codeBlockIndex = 0;

  // Handle code blocks with language specification (```language\ncode```)
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
    const escapedCode = escapeHtml(code.trim());
    const languageClass = lang ? `language-${lang}` : '';
    codeBlocks[placeholder] = `<pre class="code-block ${languageClass}"><code>${escapedCode}</code></pre>`;
    codeBlockIndex++;
    return placeholder;
  });

  // Escape remaining HTML
  formatted = escapeHtml(formatted);

  // Restore code blocks
  Object.keys(codeBlocks).forEach(placeholder => {
    formatted = formatted.replace(placeholder, codeBlocks[placeholder]);
  });

  // Format inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Format headers
  formatted = formatted.replace(/^### (.*$)/gm, '<h4 class="text-base font-semibold mt-4 mb-2 text-gray-900">$1</h4>');
  formatted = formatted.replace(/^## (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900">$1</h3>');
  formatted = formatted.replace(/^# (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-gray-900">$1</h2>');

  // Format bold text
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Format italic text
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Format lists
  formatted = formatted.replace(/^\d+\.\s+(.*)$/gm, '<li class="ml-6 list-decimal">$1</li>');
  formatted = formatted.replace(/^[-*]\s+(.*)$/gm, '<li class="ml-6 list-disc">$1</li>');

  // Wrap consecutive list items in ul/ol tags
  formatted = formatted.replace(/(<li class="ml-6 list-decimal">.*<\/li>\n?)+/g, '<ol class="my-3">$&</ol>');
  formatted = formatted.replace(/(<li class="ml-6 list-disc">.*<\/li>\n?)+/g, '<ul class="my-3">$&</ul>');

  // Format paragraphs (preserve line breaks)
  formatted = formatted.replace(/\n\n/g, '</p><p class="mb-4">');
  formatted = formatted.replace(/\n/g, '<br/>');
  formatted = `<p class="mb-4">${formatted}</p>`;

  return formatted;
};

const QuestionDetail = ({ questionId }: any) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [question, setquestion] = useState<any>(null);
  const [answer, setanswer] = useState<any>();
  const [newanswer, setnewAnswer] = useState("");
  const [isSubmitting, setisSubmitting] = useState(false);
  const [loading, setloading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const matchedquestion = res.data.data.find(
          (u: any) => u._id === questionId
        );
        setanswer(matchedquestion.answer);
        setquestion(matchedquestion);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, [questionId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center text-gray-500 mt-4">{t("home.no_question")}</div>
    );
  }

  const handleVote = async (vote: String) => {
    if (!user) {
      toast.info("Please login to continue");
      router.push("/auth");
      return;
    }
    try {
      const res = await axiosInstance.patch(`/question/vote/${question._id}`, {
        value: vote,
        userid: user?._id,
      });
      if (res.data.data) {
        setquestion(res.data.data);
        toast.success("Vote Updated");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to Vote question");
    }
  };

  const handlebookmark = () => {
    setquestion((prev: any) => ({ ...prev, isBookmarked: !prev.isBookmarked }));
  };

  const handleSubmitanswer = async () => {
    if (!user) {
      toast.info("Please login to continue");
      router.push("/auth");
      return;
    }
    if (!newanswer.trim()) return;
    setisSubmitting(true);
    try {
      const res = await axiosInstance.post(
        `/answer/postanswer/${question?._id}`,
        {
          noofanswer: question.noofanswer,
          answerbody: newanswer,
          useranswered: user.name,
          userid: user._id,
        }
      );
      if (res.data.data) {
        const newObj = {
          answerbody: newanswer,
          useranswered: user.name,
          userid: user._id,
          answeredon: new Date().toISOString(),
        };
        setquestion((prev: any) => ({
          ...prev,
          noofanswer: prev.noofanswer + 1,
          answer: [...(prev.answer || []), newObj],
        }));
        toast.success("Answer Uploaded");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to Answer");
    } finally {
      setnewAnswer("");
      setisSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      toast.info("Please login to continue");
      router.push("/auth");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;
    try {
      const res = await axiosInstance.delete(
        `/question/delete/${question._id}`
      );
      if (res.data.message) {
        toast.success(res.data.message);
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete question");
    }
  };

  const handleDeleteanswer = async (id: String) => {
    if (!user) {
      toast.info("Please login to continue");
      router.push("/auth");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this answer?"))
      return;
    try {
      const res = await axiosInstance.delete(`/answer/delete/${question._id}`, {
        data: {
          noofanswer: question.noofanswer,
          answerid: id,
        },
      });
      if (res.data.data) {
        const updateanswer = question.answer.filter(
          (ans: any) => ans._id !== id
        );
        setquestion((prev: any) => ({
          ...prev,
          noofanswer: updateanswer.length,
          answer: updateanswer,
        }));
        toast.success("deleted successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete question");
    }
  };

  return (
    <div className="max-w-5xl">
      <style jsx global>{`
        /* Code block styling with syntax-like colors */
        .code-block {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 1.5rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          border: 1px solid #333;
        }

        .code-block code {
          color: #d4d4d4;
          font-family: inherit;
          white-space: pre;
        }

        /* Inline code styling */
        .inline-code {
          background: #f1f1f1;
          color: #c7254e;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 0.875em;
          border: 1px solid #e1e1e1;
        }
      `}</style>

      {/* Question Header */}
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-semibold mb-4 text-gray-900">
          {question.questiontitle}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{t("question_card.asked")} {new Date(question.askedon).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <Card className="mb-8">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Voting Section */}
            <div className="flex sm:flex-col items-center sm:items-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-600 hover:text-orange-500"
                onClick={() => handleVote("upvote")}
              >
                <ChevronUp className="w-6 h-6" />
              </Button>
              <span className="text-xl font-semibold">
                {question.upvote.length - question.downvote.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-600 hover:text-orange-500"
                onClick={() => handleVote("downvote")}
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
              <div className="flex sm:flex-col gap-2 sm:gap-4 mt-4 sm:mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 ${question?.isBookmarked
                      ? "text-yellow-500"
                      : "text-gray-600 hover:text-yellow-500"
                    }`}
                  onClick={handlebookmark}
                >
                  <Bookmark
                    className="w-5 h-5"
                    fill={question?.isBookmarked ? "currentColor" : "none"}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-600 hover:text-gray-800"
                >
                  <History className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4 sm:p-6">
              <div className="prose max-w-none mb-6">
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: formatContent(question.questionbody),
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {question.questiontags.map((tag: any) => (
                  <Link key={tag} href={`/tags/${tag}`}>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Share className="w-4 h-4 mr-1" />
                    {t("post_card.share") || "Share"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    {t("post_card.flag") || "Flag"}
                  </Button>
                  {question.userid === user?._id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash className="w-4 h-4 mr-1" />
                      {t("post_card.delete") || "Delete"}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">
                    {t("question_card.asked")} {new Date(question.askedon).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/users/${question.userid}`}
                    className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-sm bg-orange-500 text-white">
                        {question.userposted[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-blue-600 hover:text-blue-800 font-medium">
                        {question.userposted}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          {question.answer.length} {question.answer.length !== 1 ? t("question_detail.answers") || "Answers" : t("question_detail.answer") || "Answer"}
        </h2>
        <div className="space-y-6">
          {question.answer.map((ans: any) => (
            <Card key={ans._id}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="prose max-w-none mb-6">
                      <div
                        className="text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: formatContent(ans.answerbody),
                        }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Share className="w-4 h-4 mr-1" />
                          {t("post_card.share") || "Share"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Flag className="w-4 h-4 mr-1" />
                          {t("post_card.flag") || "Flag"}
                        </Button>
                        {ans.userid === user?._id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteanswer(ans._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash className="w-4 h-4 mr-1" />
                            {t("post_card.delete") || "Delete"}
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">
                          {t("question_card.asked")} {new Date(ans.answeredon).toLocaleDateString()}
                        </span>
                        <Link
                          href={`/users/${ans.userid}`}
                          className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-sm bg-orange-500 text-white">
                              {ans.useranswered[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-blue-600 hover:text-blue-800 font-medium">
                              {ans.useranswered}
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Answer Input Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {t("question_detail.post_answer")}
          </h3>
          <div className="mb-2 text-sm text-gray-600">
            <p className="font-medium mb-1">You can use Markdown formatting:</p>
            <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
              <li>Code blocks: <code className="bg-gray-100 px-1 rounded">```language</code> followed by your code then <code className="bg-gray-100 px-1 rounded">```</code></li>
              <li>Inline code: <code className="bg-gray-100 px-1 rounded">`your code`</code></li>
              <li>{t("question_detail.code_blocks_example") || "Code blocks: "} <code className="bg-gray-100 px-1 rounded">```language</code> {t("question_detail.followed_by_code") || "followed by your code then"} <code className="bg-gray-100 px-1 rounded">```</code></li>
              <li>{t("question_detail.inline_code_example") || "Inline code: "} <code className="bg-gray-100 px-1 rounded">`your code`</code></li>
              <li>{t("question_detail.headers_example") || "Headers: "} <code className="bg-gray-100 px-1 rounded">## Header</code> {t("question_detail.or") || "or"} <code className="bg-gray-100 px-1 rounded">### Smaller Header</code></li>
              <li>{t("question_detail.bold_italic_example") || "Bold: "} <code className="bg-gray-100 px-1 rounded">**text**</code> | {t("question_detail.italic") || "Italic: "} <code className="bg-gray-100 px-1 rounded">*text*</code></li>
            </ul>
          </div>
          <Textarea
            placeholder={t("question_detail.add_answer_placeholder") || "Write your answer here..."}
            value={newanswer}
            onChange={(e) => setnewAnswer(e.target.value)}
            className="min-h-48 mb-4 resize-none font-mono text-sm"
          />
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              onClick={handleSubmitanswer}
              disabled={!newanswer.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? t("question_detail.posting") : t("question_detail.post_answer")}
            </Button>
            <p className="text-sm text-gray-600">
              By posting your answer, you agree to the{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                privacy policy
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                terms of service
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionDetail;
