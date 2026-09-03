"use client";

import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, PhotoIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-hot-toast";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    topBannerText: "",
    heroHeading: "",
    heroSubheading: "",
    heroButtonText: "",
    heroButtonLink: "",
    heroImage: "",
  });

  const [categories, setCategories] = useState<{title: string, link: string, img: string}[]>([]);
  const [highlights, setHighlights] = useState<{title: string, subtitle: string, description: string, img: string, link: string, bgColor?: string}[]>([]);
  const [reviews, setReviews] = useState<string[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [heroUrlInput, setHeroUrlInput] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings({
          topBannerText: data.topBannerText || "",
          heroHeading: data.heroHeading || "",
          heroSubheading: data.heroSubheading || "",
          heroButtonText: data.heroButtonText || "",
          heroButtonLink: data.heroButtonLink || "",
          heroImage: data.heroImage || "",
        });
        
        let parsedHeroImages: string[] = [];
        if (data.heroImage) {
          if (data.heroImage.trim().startsWith("[")) {
            try { parsedHeroImages = JSON.parse(data.heroImage); } catch {}
          } else {
            parsedHeroImages = [data.heroImage];
          }
        }
        if (parsedHeroImages.length === 0) {
          parsedHeroImages = ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"];
        }
        setHeroImages(parsedHeroImages);

        try { if(data.categories) setCategories(JSON.parse(data.categories)); } catch(e) {}
        try { if(data.highlights) setHighlights(JSON.parse(data.highlights)); } catch(e) {}
        try { if(data.reviews) setReviews(JSON.parse(data.reviews)); } catch(e) {}
        
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleHeroImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setHeroImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMoveHeroImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === heroImages.length - 1) return;

    setHeroImages((prev) => {
      const newImages = [...prev];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      return newImages;
    });
  };

  const handleRemoveHeroImage = (indexToRemove: number) => {
    if (heroImages.length <= 1) {
      toast.error("Please keep at least one background image for the hero banner.");
      return;
    }
    setHeroImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddHeroUrl = () => {
    if (!heroUrlInput.trim()) return;
    setHeroImages((prev) => [...prev, heroUrlInput.trim()]);
    setHeroUrlInput("");
    toast.success("Hero image added!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...settings,
        heroImage: JSON.stringify(heroImages),
        categories: JSON.stringify(categories),
        highlights: JSON.stringify(highlights),
        reviews: JSON.stringify(reviews)
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Homepage Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Top Banner</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Text</label>
            <input type="text" name="topBannerText" value={settings.topBannerText} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-md" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Hero Section Slideshow</h2>
              <p className="text-xs text-gray-500 mt-0.5">Upload unlimited background images that will automatically slide across the homepage banner.</p>
            </div>
            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full border">
              {heroImages.length} {heroImages.length === 1 ? "Image" : "Images in Carousel"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
              <input type="text" name="heroHeading" value={settings.heroHeading} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-md font-serif text-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subheading</label>
              <input type="text" name="heroSubheading" value={settings.heroSubheading} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                <input type="text" name="heroButtonText" value={settings.heroButtonText} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                <input type="text" name="heroButtonLink" value={settings.heroButtonLink} onChange={handleChange} className="w-full border border-gray-300 p-2 rounded-md" />
              </div>
            </div>

            {/* Unlimited Multi-Image Hero Carousel Upload */}
            <div className="border-t border-gray-100 pt-6">
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Hero Background Slideshow Images (No Upload Restrictions)
              </label>
              <p className="text-xs text-gray-500 mb-4">
                Select multiple files or upload as many images as you want. The homepage hero will cross-fade through all of them smoothly.
              </p>

              {/* Upload Controls */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <label className="cursor-pointer bg-black text-white hover:bg-gray-800 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center shadow-xs transition-colors">
                  <PhotoIcon className="w-4 h-4 mr-2" /> Upload Images (Select Multiple)
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleHeroImagesUpload}
                  />
                </label>

                {/* Paste URL */}
                <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                  <input
                    type="text"
                    placeholder="Or paste image URL (https://...)"
                    value={heroUrlInput}
                    onChange={(e) => setHeroUrlInput(e.target.value)}
                    className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHeroUrl();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddHeroUrl}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Slides Grid Preview with Reordering & Deletion */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {heroImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-xs"
                  >
                    <img
                      src={imgUrl}
                      alt={`Hero Slide ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Badge */}
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {idx === 0 ? "★ Slide #1 (Default)" : `Slide #${idx + 1}`}
                    </div>

                    {/* Action Bar on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => handleMoveHeroImage(idx, 'left')}
                        disabled={idx === 0}
                        className="p-1.5 bg-white text-gray-800 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                        title="Move Left"
                      >
                        <ArrowUpIcon className="w-3.5 h-3.5 -rotate-90" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveHeroImage(idx, 'right')}
                        disabled={idx === heroImages.length - 1}
                        className="p-1.5 bg-white text-gray-800 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                        title="Move Right"
                      >
                        <ArrowDownIcon className="w-3.5 h-3.5 -rotate-90" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveHeroImage(idx)}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Delete Slide"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Categories Section</h2>
            <button type="button" onClick={() => setCategories([...categories, {title: "", link: "", img: ""}])} className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 flex items-center">
              <PlusIcon className="w-4 h-4 mr-1" /> Add Category
            </button>
          </div>
          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex gap-4 items-start border p-4 rounded-md relative mt-4">
                <div className="absolute -top-3 -right-3 flex items-center bg-white shadow border rounded-full overflow-hidden">
                  <button type="button" onClick={() => { if (idx > 0) { const newArr = [...categories]; [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]]; setCategories(newArr); } }} disabled={idx === 0} className="p-1.5 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 border-r border-gray-200">
                    <ArrowUpIcon className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => { if (idx < categories.length - 1) { const newArr = [...categories]; [newArr[idx + 1], newArr[idx]] = [newArr[idx], newArr[idx + 1]]; setCategories(newArr); } }} disabled={idx === categories.length - 1} className="p-1.5 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 border-r border-gray-200">
                    <ArrowDownIcon className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setCategories(categories.filter((_, i) => i !== idx))} className="p-1.5 text-red-500 hover:bg-red-50">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 overflow-hidden border">
                  {cat.img ? <img src={cat.img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="text" placeholder="Title" value={cat.title} onChange={e => { const newCats = [...categories]; newCats[idx].title = e.target.value; setCategories(newCats); }} className="w-full border border-gray-300 p-2 rounded-md text-sm" />
                  <input type="text" placeholder="Link (e.g. /shop?category=Dresses)" value={cat.link} onChange={e => { const newCats = [...categories]; newCats[idx].link = e.target.value; setCategories(newCats); }} className="w-full border border-gray-300 p-2 rounded-md text-sm" />
                  <label className="cursor-pointer w-full bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium border flex items-center justify-center">
                    <PhotoIcon className="w-4 h-4 mr-2" /> {cat.img ? "Change Image" : "Upload Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, (base64) => { const newCats = [...categories]; newCats[idx].img = base64; setCategories(newCats); })} />
                  </label>
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-gray-500">No categories added yet.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Highlights Section (Max 3)</h2>
            <button type="button" onClick={() => setHighlights([...highlights, {title: "", subtitle: "", description: "", img: "", link: "", bgColor: "#BADDF2"}])} disabled={highlights.length >= 3} className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 flex items-center disabled:opacity-50">
              <PlusIcon className="w-4 h-4 mr-1" /> Add Highlight
            </button>
          </div>
          <div className="space-y-4">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2 border p-4 rounded-md relative mt-4">
                <div className="absolute -top-3 -right-3 flex items-center bg-white shadow border rounded-full overflow-hidden">
                  <button type="button" onClick={() => { if (idx > 0) { const newArr = [...highlights]; [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]]; setHighlights(newArr); } }} disabled={idx === 0} className="p-1.5 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 border-r border-gray-200">
                    <ArrowUpIcon className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => { if (idx < highlights.length - 1) { const newArr = [...highlights]; [newArr[idx + 1], newArr[idx]] = [newArr[idx], newArr[idx + 1]]; setHighlights(newArr); } }} disabled={idx === highlights.length - 1} className="p-1.5 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 border-r border-gray-200">
                    <ArrowDownIcon className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setHighlights(highlights.filter((_, i) => i !== idx))} className="p-1.5 text-red-500 hover:bg-red-50">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Title" value={item.title} onChange={e => { const newArr = [...highlights]; newArr[idx].title = e.target.value; setHighlights(newArr); }} className="border border-gray-300 p-2 rounded-md text-sm" />
                  <input type="text" placeholder="Subtitle (e.g. Save 10%)" value={item.subtitle} onChange={e => { const newArr = [...highlights]; newArr[idx].subtitle = e.target.value; setHighlights(newArr); }} className="border border-gray-300 p-2 rounded-md text-sm" />
                  <input type="text" placeholder="Link" value={item.link} onChange={e => { const newArr = [...highlights]; newArr[idx].link = e.target.value; setHighlights(newArr); }} className="border border-gray-300 p-2 rounded-md text-sm" />
                  <div className="flex items-center gap-2 border border-gray-300 p-1.5 rounded-md text-sm overflow-hidden bg-white">
                    {item.img && <img src={item.img} alt="" className="w-6 h-6 object-cover rounded" />}
                    <label className="cursor-pointer flex-1 text-center bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs font-medium">
                      Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, (base64) => { const newArr = [...highlights]; newArr[idx].img = base64; setHighlights(newArr); })} />
                    </label>
                  </div>
                  <div className="col-span-2 flex items-center gap-3">
                    <label className="text-[12px] font-bold tracking-widest uppercase text-gray-500">Background Color:</label>
                    <input type="color" value={item.bgColor || "#BADDF2"} onChange={e => { const newArr = [...highlights]; newArr[idx].bgColor = e.target.value; setHighlights(newArr); }} className="w-10 h-10 p-1 bg-white border border-gray-300 rounded cursor-pointer" title="Choose background color for text-only highlights" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2 block">Description</label>
                    <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                      <ReactQuill theme="snow" value={item.description} onChange={(val) => { const newArr = [...highlights]; newArr[idx].description = val; setHighlights(newArr); }} className="h-32 mb-10" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {highlights.length === 0 && <p className="text-sm text-gray-500">No highlights added yet.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Customer Reviews</h2>
            <button type="button" onClick={() => setReviews([...reviews, ""])} className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 flex items-center">
              <PlusIcon className="w-4 h-4 mr-1" /> Add Review Image
            </button>
          </div>
          <div className="space-y-4">
            {reviews.map((rev, idx) => (
              <div key={idx} className="flex gap-4 items-center border p-2 rounded-md relative">
                {rev ? <img src={rev} alt="" className="w-12 h-12 object-cover rounded border" /> : <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center"><PhotoIcon className="w-5 h-5 text-gray-400" /></div>}
                <label className="cursor-pointer flex-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium border flex items-center justify-center">
                  <PhotoIcon className="w-4 h-4 mr-2" /> Upload Review Image
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, (base64) => { const newArr = [...reviews]; newArr[idx] = base64; setReviews(newArr); })} />
                </label>
                <button type="button" onClick={() => setReviews(reviews.filter((_, i) => i !== idx))} className="text-red-500 p-2 hover:bg-red-50 rounded">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-gray-500">No review images added yet.</p>}
          </div>
        </div>

        <button type="submit" disabled={saving} className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
