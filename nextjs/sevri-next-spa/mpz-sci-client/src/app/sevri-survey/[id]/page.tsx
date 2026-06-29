'use client'
import { useSevriStore } from "@/store/sevriModel/sevriStore";
import { useEffect } from "react";

import ActivityForm from "@/components/sevri/form/ActivityForm";

const SurveyPage = ({ params }: { params: { id: number } }) => {
    const { actualActivity, getActivity } = useSevriStore();
    useEffect(() => {
        getActivity(params.id);
    }, []);

    return (
        <div className="bg-gray-100">
            <ActivityForm activity={actualActivity} />
        </div>
    );
};

export default SurveyPage;
