import streamlit as st
import streamlit.components.v1 as components
import os
import base64

# 1. STREAMLIT PAGE CONFIGURATION
st.set_page_config(
    page_title="Project Orbit: Sentinel V-1 Telemetry",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit Default UI styling and make the component iframe full viewport
st.markdown("""
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .block-container {
        padding: 0 !important;
        max-width: 100% !important;
        height: 100vh !important;
    }
    iframe {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw !important;
        height: 100vh !important;
        border: none !important;
        z-index: 99999;
    }
    body {
        margin: 0;
        padding: 0;
        overflow: hidden;
    }
    </style>
""", unsafe_allow_html=True)

# 2. HELPER FUNCTIONS
@st.cache_data
def get_base64_images():
    """Reads all 40 frames and base64 encodes them into Data URIs."""
    base64_frames = []
    frames_dir = os.path.join(os.path.dirname(__file__), "satellite")
    
    for i in range(1, 41):
        filename = f"ezgif-frame-{str(i).zfill(3)}.jpg"
        filepath = os.path.join(frames_dir, filename)
        if os.path.exists(filepath):
            with open(filepath, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
                base64_frames.append(f"data:image/jpeg;base64,{encoded_string}")
        else:
            # Add an empty placeholder to maintain index mapping in case of missing files
            base64_frames.append("")
            
    return base64_frames

@st.cache_data
def compile_html():
    """Reads HTML, CSS, JS, and compiles them with base64 assets into a single package."""
    root_dir = os.path.dirname(__file__)
    
    # Read core files
    with open(os.path.join(root_dir, "index.html"), "r", encoding="utf-8") as f:
        html = f.read()
        
    with open(os.path.join(root_dir, "styles.css"), "r", encoding="utf-8") as f:
        css = f.read()
        
    with open(os.path.join(root_dir, "app.js"), "r", encoding="utf-8") as f:
        js = f.read()
        
    base64_images = get_base64_images()
    
    # Inline Base64 images array inside the HTML head
    images_script = f"""
    <script>
        window.BASE64_IMAGES = {str(base64_images)};
    </script>
    """
    
    # Find head and insert base64 script
    html = html.replace("<head>", f"<head>{images_script}")
    
    # Inline CSS styles replacing external link stylesheet
    html = html.replace(
        '<link rel="stylesheet" href="styles.css">',
        f"<style>{css}</style>"
    )
    
    # Inline JS logic replacing external script link
    html = html.replace(
        '<script src="app.js"></script>',
        f"<script>{js}</script>"
    )
    
    return html

# 3. RENDER THE INTERACTIVE APP
try:
    compiled_app_html = compile_html()
    # Serve component inside the full-viewport iframe
    components.html(compiled_app_html, height=1080, scrolling=True)
except Exception as e:
    st.error(f"Error compiling web application components: {str(e)}")
