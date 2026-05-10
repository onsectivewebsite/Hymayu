import os

def fix_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    skip = False
    in_nav = False
    
    for i, line in enumerate(lines):
        if '<!-- ===== Navigation ===== -->' in line:
            in_nav = True
            new_lines.append(line)
            continue
        
        if in_nav:
            if '</nav>' in line:
                # Extract active page from links
                active_link = 'index.html'
                for l in lines[max(0, i-30):min(len(lines), i+10)]:
                    if 'class="active"' in l and 'href="' in l:
                        active_link = l.split('href="')[1].split('"')[0]
                
                # Check if it's a blog post (path starts with ../)
                is_blog = '../' in lines[i-5] if i > 5 else False
                prefix = '../' if is_blog else ''
                
                new_nav = f"""<nav class="nav">
    <div class="container nav-inner">
        <div class="brand-left">
            <a href="{prefix}index.html" class="brand">
                <img src="{prefix}assets/logo.png" alt="Indus Canada CPA">
            </a>
        </div>
        <ul class="nav-links">
            <li><a href="{prefix}index.html" {'class="active"' if 'index.html' in active_link and not is_blog else ''}>Home</a></li>
            <li><a href="{prefix}about.html" {'class="active"' if 'about.html' in active_link else ''}>About</a></li>
            <li><a href="{prefix}services.html" {'class="active"' if 'services.html' in active_link else ''}>Services</a></li>
            <li><a href="{prefix}calculators.html" {'class="active"' if 'calculators.html' in active_link else ''}>Calculators</a></li>
            <li><a href="{prefix}blog.html" {'class="active"' if 'blog.html' in active_link else ''}>Blog</a></li>
            <li><a href="{prefix}contact.html" {'class="active"' if 'contact.html' in active_link else ''}>Contact</a></li>
            <li><a href="{prefix}contact.html" class="btn btn-primary"><i class="bi bi-calendar-check"></i> Book Consultation</a></li>
        </ul>
        <div class="brand-right">
            <img src="{prefix}assets/cpa_logo.png" alt="CPA Logo">
        </div>
        <button class="menu-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
</nav>
"""
                new_lines.append(new_nav)
                in_nav = False
                continue
            else:
                continue
        else:
            new_lines.append(line)
            
    with open(filepath, 'w') as f:
        f.writelines(new_lines)

files = ['index.html', 'about.html', 'services.html', 'contact.html', 'blog.html', 'calculators.html']
blog_files = [os.path.join('blog', f) for f in os.listdir('blog') if f.endswith('.html')]

for f in files + blog_files:
    if os.path.exists(f):
        print(f"Fixing {f}")
        fix_file(f)
