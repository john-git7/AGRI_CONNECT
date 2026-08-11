import React from "react";
import { CheckCircle2, Cloud, HelpCircle, DollarSign, Calendar } from "lucide-react";

const Timeline = ({ updates }) => {
  if (!updates || updates.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        No progress logs recorded yet for this project.
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-emerald-100 space-y-8 my-4">
      {updates.map((update, idx) => {
        const dateStr = new Date(update.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });

        return (
          <div key={update._id || idx} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1 bg-white p-1 rounded-full border-2 border-emerald-600 text-emerald-700 shadow-sm group-hover:bg-emerald-50 transition">
              <CheckCircle2 size={16} />
            </div>

            {/* Content Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow transition">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    {update.stage}
                  </span>
                  <span className="ml-3 text-xs font-semibold text-emerald-600">
                    {update.progressPercentage}% Progress
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar size={12} /> {dateStr}
                </div>
              </div>

              {update.notes && (
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  "{update.notes}"
                </p>
              )}

              {/* Grid metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-50 text-xs">
                {update.weatherObservation && (
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Cloud size={14} className="text-sky-500" />
                    <span>Weather: {update.weatherObservation}</span>
                  </div>
                )}
                {update.expenses !== undefined && update.expenses > 0 && (
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <DollarSign size={14} className="text-amber-500" />
                    <span>Expense logged: ₹{update.expenses.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {update.estimatedYield !== undefined && (
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <HelpCircle size={14} className="text-emerald-500" />
                    <span>Est. Yield: {update.estimatedYield} tonnes</span>
                  </div>
                )}
              </div>

              {/* Uploaded Photos */}
              {update.photos && update.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {update.photos.map((photo, pIdx) => (
                    <img
                      key={pIdx}
                      src={`http://localhost:5000${photo}`}
                      alt="Crop progress"
                      className="h-20 w-24 object-cover rounded-lg border border-slate-100 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(`http://localhost:5000${photo}`, "_blank")}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
